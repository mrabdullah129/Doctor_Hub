import { supabase } from './supabase'

// ── Appointments ──────────────────────────────────────────────────────────────

export async function createAppointment(data) {
  const { data: result, error } = await supabase
    .from('appointments')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return result
}

export async function getPatientAppointments(patientId) {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctor_id (
        id, display_name, specialization, consultation_fee
      )
    `)
    .eq('patient_id', patientId)
    .order('appointment_date', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getDoctorAppointments(doctorId) {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:patient_id ( id, full_name, phone, email )
    `)
    .eq('doctor_id', doctorId)
    .order('appointment_date', { ascending: true })
  if (error) throw error
  return data || []
}

export async function updateAppointmentStatus(id, status) {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Payments ──────────────────────────────────────────────────────────────────

export async function createPayment(data) {
  const { data: result, error } = await supabase
    .from('payments')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return result
}

export async function getPendingPayments() {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      appointment:appointment_id (
        id, appointment_date, appointment_time, reason, fee, status,
        patient:patient_id ( id, full_name, email, phone ),
        doctor:doctor_id ( id, display_name, specialization )
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function verifyPayment(paymentId, appointmentId, verifiedBy) {
  const [paymentResult, apptResult] = await Promise.all([
    supabase
      .from('payments')
      .update({
        status: 'verified',
        verified_by: verifiedBy,
        verified_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select()
      .single(),
    supabase
      .from('appointments')
      .update({ status: 'confirmed' })
      .eq('id', appointmentId)
      .select()
      .single(),
  ])
  if (paymentResult.error) throw paymentResult.error
  if (apptResult.error) throw apptResult.error
  return { payment: paymentResult.data, appointment: apptResult.data }
}

export async function rejectPayment(paymentId, appointmentId, reason) {
  const [paymentResult, apptResult] = await Promise.all([
    supabase
      .from('payments')
      .update({
        status: 'rejected',
        rejection_reason: reason || 'Rejected by assistant',
      })
      .eq('id', paymentId)
      .select()
      .single(),
    supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointmentId)
      .select()
      .single(),
  ])
  if (paymentResult.error) throw paymentResult.error
  if (apptResult.error) throw apptResult.error
  return { payment: paymentResult.data, appointment: apptResult.data }
}

// ── Doctors ───────────────────────────────────────────────────────────────────

export async function getVerifiedDoctors() {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('is_verified', true)
    .eq('is_available', true)
    .order('display_name', { ascending: true })
  if (error) throw error
  return data || []
}

export async function getDoctorById(id) {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function getDoctorByProfileId(profileId) {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('profile_id', profileId)
    .single()
  if (error) throw error
  return data
}
