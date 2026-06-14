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
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: 'Supabase function environment is not configured' }, 500)
  }

  const body = await req.json().catch(() => ({}))
  const username = String(body.username || '').trim().toLowerCase()
  if (!username) return json({ error: 'Username is required' }, 400)

  const adminClient = createClient(supabaseUrl, serviceRoleKey)
  const { data, error } = await adminClient
    .from('assistants')
    .select('profile:profile_id(email)')
    .eq('username', username)
    .eq('is_active', true)
    .maybeSingle()

  if (error || !data?.profile?.email) return json({ error: 'Assistant not found' }, 404)

  return json({ email: data.profile.email })
})
