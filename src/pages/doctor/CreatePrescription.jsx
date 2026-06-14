import { useEffect, useState, useMemo } from 'react'
import { Plus, Trash2, Printer, Download, Save, Pill } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import useAppointmentStore from '../../store/appointmentStore'
import { createPrescription } from '../../lib/dataService'
import { supabase } from '../../lib/supabase'
import { downloadPrescriptionPdf } from '../../lib/prescriptionPdf'

const createEmptyMedicine = () => ({
  id: globalThis.crypto?.randomUUID?.() || `med-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name: '',
  strength: '',
  form: 'Tablet',
  dosage: '',
  frequency: '',
  duration: '',
  instructions: '',
})

export default function CreatePrescription() {
  const { profile } = useAuthStore()
  const { getAllAppointments } = useAppointmentStore()

  // Build patient list from real appointments for this doctor
  const [patients, setPatients] = useState([])
  const [doctorRecordId, setDoctorRecordId] = useState('')
  const [doctorInfo, setDoctorInfo] = useState({ name: '', specialty: '' })

  const localPatients = useMemo(() => {
    const all = getAllAppointments()
    const doctorName = (profile?.full_name || '').toLowerCase().trim()
    const seen = new Set()

    return all
      .filter(a => {
        if (!a.patientId) return false
        if (seen.has(a.patientId)) return false
        // Match appointments for this doctor
        const match = (a.doctor || '').toLowerCase().trim() === doctorName ||
          String(a.doctorId) === String(profile?.id) ||
          String(a.doctorProfileId) === String(profile?.id)
        if (!match) return false
        seen.add(a.patientId)
        return true
      })
      .map(a => ({
        value: a.patientId,
        label: a.patientName || a.patient || (a.patientEmail ? a.patientEmail.split('@')[0] : 'Patient'),
      }))
  }, [getAllAppointments, profile])

  useEffect(() => {
    let cancelled = false

    async function loadPatients() {
      if (!profile?.id) return

      const doctorProfileId = profile.id

      try {
        const { data: doctorRow } = await supabase
          .from('doctors')
          .select('id, display_name, specialization')
          .eq('profile_id', doctorProfileId)
          .maybeSingle()

        const doctorId = doctorRow?.id
        if (!cancelled) setDoctorRecordId(doctorId || '')
        if (!cancelled) {
          setDoctorInfo({
            name: doctorRow?.display_name || profile?.full_name || 'Doctor',
            specialty: doctorRow?.specialization || '',
          })
        }
        if (!doctorId) {
          if (!cancelled) setPatients(localPatients)
          return
        }

        const { data, error } = await supabase
          .from('appointments')
          .select(`
            patient_id,
            patient:patient_id ( id, full_name, email )
          `)
          .eq('doctor_id', doctorId)
          .order('created_at', { ascending: false })

        if (error) throw error

        const unique = new Map()
        ;(data || []).forEach((row) => {
          const patientId = row.patient_id || row.patient?.id
          if (!patientId || unique.has(patientId)) return
          unique.set(patientId, {
            value: patientId,
            label: row.patient?.full_name || row.patient?.email || 'Patient',
          })
        })

        if (!cancelled) {
          const remotePatients = Array.from(unique.values())
          setPatients(remotePatients.length ? remotePatients : localPatients)
        }
      } catch (err) {
        console.warn('Failed to load patients from Supabase, using local store:', err)
        if (!cancelled) setPatients(localPatients)
      }
    }

    loadPatients()
    return () => { cancelled = true }
  }, [profile, localPatients])

  const [patient, setPatient] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [medicines, setMedicines] = useState([createEmptyMedicine()])
  const [advice, setAdvice] = useState('')
  const [followUp, setFollowUp] = useState('')
  const [saving, setSaving] = useState(false)

  const addMedicine = () => setMedicines([...medicines, createEmptyMedicine()])
  const removeMedicine = (id) => setMedicines(medicines.filter((medicine) => medicine.id !== id))
  const updateMedicine = (id, field, value) => {
    const updated = medicines.map((medicine) => (
      medicine.id === id ? { ...medicine, [field]: value } : medicine
    ))
    setMedicines(updated)
  }

  const selectedPatientName = patients.find(p => p.value === patient)?.label || ''

  const handleExportPdf = () => {
    if (!patient || !diagnosis || medicines.some((medicine) => !medicine.name)) {
      toast.error('Please fill in all required fields first')
      return
    }

    downloadPrescriptionPdf(
      {
        id: `draft-${Date.now()}`,
        date: new Date().toISOString(),
        doctor: doctorInfo.name || profile?.full_name || 'Doctor',
        specialty: doctorInfo.specialty || '-',
        patientName: selectedPatientName || 'Patient',
        diagnosis,
        medicines,
        advice,
        followUp,
      },
      { filename: `prescription-${selectedPatientName || 'patient'}.pdf` }
    )
  }

  const handleSave = async () => {
    if (!patient || !diagnosis || !doctorRecordId || medicines.some((m) => !m.name)) {
      toast.error('Please fill in all required fields')
      return
    }
    setSaving(true)
    try {
      const payload = {
        patient_id: patient,
        doctor_id: doctorRecordId,
        diagnosis,
        medicines,
        advice,
        follow_up: followUp,
        is_active: true,
      }
      await createPrescription(payload)
      toast.success(`Prescription saved for ${selectedPatientName}!`)
      // reset form
      setPatient('')
      setDiagnosis('')
      setMedicines([createEmptyMedicine()])
      setAdvice('')
      setFollowUp('')
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to save prescription')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Create Prescription</h1>
          <p className="text-text-muted mt-1">Digital prescription — immutable once issued</p>
        </div>

        {/* Patient & Diagnosis */}
        <Card>
          <CardTitle className="mb-5">Patient Information</CardTitle>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="patient-select" className="block text-sm font-semibold text-text-secondary mb-2">
                Select Patient *
              </label>
              {patients.length === 0 ? (
                <div className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm text-text-muted">
                  No patients yet — patients who book appointments will appear here
                </div>
              ) : (
                <select
                  id="patient-select"
                  value={patient}
                  onChange={e => setPatient(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-surface-200 rounded-xl text-text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value="">Select a patient</option>
                  {patients.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              )}
            </div>
            <Input
              label="Primary Diagnosis *"
              placeholder="e.g., Hypertension Stage 1"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </div>
        </Card>

        {/* Medicines */}
        <Card>
          <CardHeader
            action={
              <Button variant="secondary" size="sm" icon={Plus} onClick={addMedicine}>
                Add Medicine
              </Button>
            }
          >
            <CardTitle>Prescribed Medicines</CardTitle>
          </CardHeader>

          <div className="space-y-4">
            {medicines.map((med, i) => (
              <div key={med.id} className="p-4 bg-surface-50 rounded-xl border border-surface-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                      <Pill className="w-4 h-4 text-teal-600" />
                    </div>
                    <span className="font-semibold text-text-primary text-sm">Medicine #{i + 1}</span>
                  </div>
                  {medicines.length > 1 && (
                    <button
                      onClick={() => removeMedicine(med.id)}
                      className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Input
                    label="Medicine Name *"
                    placeholder="e.g., Lisinopril"
                    value={med.name}
                    onChange={(e) => updateMedicine(med.id, 'name', e.target.value)}
                  />
                  <Input
                    label="Strength"
                    placeholder="e.g., 10mg"
                    value={med.strength}
                    onChange={(e) => updateMedicine(med.id, 'strength', e.target.value)}
                  />
                  <Select
                    label="Form"
                    options={['Tablet', 'Capsule', 'Syrup', 'Injection', 'Inhaler', 'Drops', 'Cream', 'Ointment']}
                    value={med.form}
                    onChange={(e) => updateMedicine(med.id, 'form', e.target.value)}
                  />
                  <Input
                    label="Dosage"
                    placeholder="e.g., 1 tablet"
                    value={med.dosage}
                    onChange={(e) => updateMedicine(med.id, 'dosage', e.target.value)}
                  />
                  <Select
                    label="Frequency"
                    options={['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'At bedtime', 'As needed', 'With meals', 'Before meals']}
                    placeholder="Select frequency"
                    value={med.frequency}
                    onChange={(e) => updateMedicine(med.id, 'frequency', e.target.value)}
                  />
                  <Select
                    label="Duration"
                    options={['3 days', '5 days', '7 days', '10 days', '14 days', '21 days', '30 days', '60 days', '90 days', 'Ongoing']}
                    placeholder="Select duration"
                    value={med.duration}
                    onChange={(e) => updateMedicine(med.id, 'duration', e.target.value)}
                  />
                </div>

                <div className="mt-3">
                  <Input
                    label="Special Instructions"
                    placeholder="e.g., Take with food, avoid alcohol"
                    value={med.instructions}
                    onChange={(e) => updateMedicine(med.id, 'instructions', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Advice & Follow-up */}
        <Card>
          <CardTitle className="mb-5">Additional Information</CardTitle>
          <div className="space-y-4">
            <div>
              <label htmlFor="doctor-advice" className="block text-sm font-semibold text-text-secondary mb-2">Doctor's Advice</label>
              <textarea
                id="doctor-advice"
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                placeholder="Diet advice, lifestyle changes, precautions..."
                rows={3}
                className="w-full px-4 py-3 bg-white border border-surface-200 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
              />
            </div>
            <Input
              label="Follow-up"
              placeholder="e.g., After 2 weeks, or if symptoms worsen"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <Button variant="secondary" icon={Download} onClick={handleExportPdf}>
            Export PDF
          </Button>
          <Button variant="secondary" icon={Printer} onClick={() => globalThis.print()}>
            Print
          </Button>
          <Button loading={saving} icon={Save} onClick={handleSave} className="ml-auto">
            Save & Send to Patient
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
