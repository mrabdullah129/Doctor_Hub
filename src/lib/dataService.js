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

// ── Prescriptions ───────────────────────────────────────────────────────────

export async function getPatientPrescriptions(patientId) {
  const { data, error } = await supabase
    .from('prescriptions')
    .select(`
      *,
      doctor:doctor_id ( id, display_name, specialization ),
      prescription_medicines ( id, name, strength, form, dosage, frequency, duration, instructions )
    `)
    .eq('patient_id', patientId)
    .order('issued_at', { ascending: false })
  if (error) throw error
  return (data || []).map((prescription) => ({
    id: prescription.id,
    patient_id: prescription.patient_id,
    doctor_id: prescription.doctor_id,
    diagnosis: prescription.diagnosis,
    advice: prescription.advice || '',
    follow_up: prescription.follow_up || '',
    status: prescription.is_active ? 'active' : 'inactive',
    date: prescription.issued_at,
    doctor: prescription.doctor?.display_name || 'Doctor',
    specialty: prescription.doctor?.specialization || '',
    medicines: prescription.prescription_medicines || [],
  }))
}

export async function createPrescription(payload) {
  const { medicines = [], ...prescriptionPayload } = payload

  const { data: prescription, error: prescriptionError } = await supabase
    .from('prescriptions')
    .insert(prescriptionPayload)
    .select()
    .single()

  if (prescriptionError) throw prescriptionError

  if (Array.isArray(medicines) && medicines.length > 0) {
    const medicineRows = medicines.map((medicine) => ({
      prescription_id: prescription.id,
      doctor_id: prescription.doctor_id,
      name: medicine.name,
      strength: medicine.strength || '',
      form: medicine.form || 'Tablet',
      dosage: medicine.dosage || '',
      frequency: medicine.frequency || '',
      duration: medicine.duration || '',
      instructions: medicine.instructions || '',
    }))

    const { error: medicinesError } = await supabase
      .from('prescription_medicines')
      .insert(medicineRows)

    if (medicinesError) {
      await supabase.from('prescriptions').delete().eq('id', prescription.id)
      throw medicinesError
    }
  }

  return { ...prescription, medicines }
}
