import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: 'Supabase function environment is not configured' }, 500)
  }

  const authHeader = req.headers.get('Authorization') || ''
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const adminClient = createClient(supabaseUrl, serviceRoleKey)

  const { data: authData, error: authError } = await userClient.auth.getUser()
  if (authError || !authData.user) return json({ error: 'Unauthorized' }, 401)

  const { data: requester, error: requesterError } = await adminClient
    .from('profiles')
    .select('id, role, full_name')
    .eq('id', authData.user.id)
    .maybeSingle()

  if (requesterError || requester?.role !== 'doctor') {
    return json({ error: 'Only doctors can create assistants' }, 403)
  }

  const body = await req.json().catch(() => ({}))
  const fullName = String(body.fullName || '').trim()
  const username = String(body.username || '').trim().toLowerCase()
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')

  if (!fullName || !username || !email || password.length < 6) {
    return json({ error: 'Name, username, email, and a 6+ character password are required' }, 400)
  }

  const { data: doctor, error: doctorError } = await adminClient
    .from('doctors')
    .select('id, profile_id, display_name')
    .eq('profile_id', authData.user.id)
    .maybeSingle()

  if (doctorError || !doctor) {
    return json({ error: 'Doctor profile not found' }, 404)
  }

  const { data: existingUsername } = await adminClient
    .from('assistants')
    .select('id')
    .eq('username', username)
    .maybeSingle()

  if (existingUsername) return json({ error: 'Username is already taken' }, 409)

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: 'assistant',
      created_by_doctor_id: doctor.id,
    },
  })

  if (createError || !created.user) {
    return json({ error: createError?.message || 'Failed to create assistant auth user' }, 400)
  }

  const profilePayload = {
    id: created.user.id,
    full_name: fullName,
    email,
    role: 'assistant',
    is_active: true,
  }

  const { error: profileError } = await adminClient
    .from('profiles')
    .upsert(profilePayload, { onConflict: 'id' })

  if (profileError) return json({ error: profileError.message }, 400)

  const { data: assistant, error: assistantError } = await adminClient
    .from('assistants')
    .insert({
      profile_id: created.user.id,
      doctor_id: doctor.id,
      username,
      is_active: true,
    })
    .select('id, username, created_at')
    .single()

  if (assistantError) return json({ error: assistantError.message }, 400)

  return json({
    assistant: {
      id: assistant.id,
      username: assistant.username,
      full_name: fullName,
      email,
      doctor_id: doctor.id,
      doctor_name: doctor.display_name || requester.full_name,
      created_at: assistant.created_at,
    },
  })
})
