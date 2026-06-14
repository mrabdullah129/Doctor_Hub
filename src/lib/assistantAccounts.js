import { supabase } from './supabase'

function normalize(value) {
  return String(value || '').trim().toLowerCase()
}

export async function getDoctorRecordForProfile(profileId) {
  if (!profileId) return null
  try {
    const { data } = await supabase
      .from('doctors')
      .select('id, display_name, specialization')
      .eq('profile_id', profileId)
      .maybeSingle()
    return data || null
  } catch {
    return null
  }
}

export async function createAssistantAccount(payload) {
  const { data, error } = await supabase.functions.invoke('create-assistant', {
    body: payload,
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data?.assistant
}

export async function resolveAssistantLogin(identifier) {
  const value = normalize(identifier)
  if (!value || value.includes('@')) return identifier

  const { data, error } = await supabase.functions.invoke('assistant-login-lookup', {
    body: { username: value },
  })
  if (error) return identifier
  return data?.email || identifier
}

export async function getDoctorAssistants() {
  const { data, error } = await supabase
    .from('assistants')
    .select(`
      id, username, is_active, created_at,
      profile:profile_id ( id, full_name, email )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map((assistant) => ({
    id: assistant.id,
    profileId: assistant.profile?.id,
    full_name: assistant.profile?.full_name || 'Assistant',
    email: assistant.profile?.email || '',
    username: assistant.username || '',
    is_active: assistant.is_active,
    created_at: assistant.created_at,
  }))
}

export async function getAssistantDoctorAssignment(profile) {
  if (!profile || profile.role !== 'assistant') return null

  try {
    const { data } = await supabase
      .from('assistants')
      .select(`
        doctor_id,
        username,
        doctor:doctor_id (
          id, profile_id, display_name, specialization
        )
      `)
      .eq('profile_id', profile.id)
      .eq('is_active', true)
      .maybeSingle()

    if (!data) return null

    return {
      doctorId: data.doctor_id,
      doctorProfileId: data.doctor?.profile_id,
      doctorName: data.doctor?.display_name,
      doctorSpecialty: data.doctor?.specialization,
      username: data.username,
    }
  } catch {
    return null
  }
}

export function appointmentBelongsToAssistantDoctor(appointment, profile) {
  if (!profile?.assignedDoctorId && !profile?.assignedDoctorProfileId && !profile?.assignedDoctorName) {
    return true
  }

  const assignedName = normalize(profile.assignedDoctorName)
  const appointmentDoctor = normalize(appointment.doctor)

  return (
    String(appointment.doctorId || '') === String(profile.assignedDoctorId || '') ||
    String(appointment.doctorProfileId || '') === String(profile.assignedDoctorProfileId || '') ||
    (assignedName && appointmentDoctor === assignedName)
  )
}
