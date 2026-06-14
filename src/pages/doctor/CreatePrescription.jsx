import { useState, useMemo } from 'react'
import { Plus, Trash2, Printer, Download, Save, Pill } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import useAppointmentStore from '../../store/appointmentStore'

const emptyMed = { name: '', strength: '', form: 'Tablet', dosage: '', frequency: '', duration: '', instructions: '' }

export default function CreatePrescription() {
  const { profile } = useAuthStore()
  const { getAllAppointments } = useAppointmentStore()

  // Build patient list from real appointments for this doctor
  const patients = useMemo(() => {
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

  const [patient, setPatient] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [medicines, setMedicines] = useState([{ ...emptyMed }])
  const [advice, setAdvice] = useState('')
  const [followUp, setFollowUp] = useState('')
  const [saving, setSaving] = useState(false)

  const addMedicine = () => setMedicines([...medicines, { ...emptyMed }])
  const removeMedicine = (i) => setMedicines(medicines.filter((_, idx) => idx !== i))
  const updateMedicine = (i, field, value) => {
    const updated = [...medicines]
    updated[i] = { ...updated[i], [field]: value }
    setMedicines(updated)
  }

  const selectedPatientName = patients.find(p => p.value === patient)?.label || ''

  const handleSave = async () => {
    if (!patient || !diagnosis || medicines.some((m) => !m.name)) {
      toast.error('Please fill in all required fields')
      return
    }
    setSaving(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSaving(false)
    toast.success(`Prescription saved for ${selectedPatientName}!`)
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
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Select Patient *
              </label>
              {patients.length === 0 ? (
                <div className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm text-text-muted">
                  No patients yet — patients who book appointments will appear here
                </div>
              ) : (
                <select
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
              <div key={i} className="p-4 bg-surface-50 rounded-xl border border-surface-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                      <Pill className="w-4 h-4 text-teal-600" />
                    </div>
                    <span className="font-semibold text-text-primary text-sm">Medicine #{i + 1}</span>
                  </div>
                  {medicines.length > 1 && (
                    <button
                      onClick={() => removeMedicine(i)}
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
                    onChange={(e) => updateMedicine(i, 'name', e.target.value)}
                  />
                  <Input
                    label="Strength"
                    placeholder="e.g., 10mg"
                    value={med.strength}
                    onChange={(e) => updateMedicine(i, 'strength', e.target.value)}
                  />
                  <Select
                    label="Form"
                    options={['Tablet', 'Capsule', 'Syrup', 'Injection', 'Inhaler', 'Drops', 'Cream', 'Ointment']}
                    value={med.form}
                    onChange={(e) => updateMedicine(i, 'form', e.target.value)}
                  />
                  <Input
                    label="Dosage"
                    placeholder="e.g., 1 tablet"
                    value={med.dosage}
                    onChange={(e) => updateMedicine(i, 'dosage', e.target.value)}
                  />
                  <Select
                    label="Frequency"
                    options={['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'At bedtime', 'As needed', 'With meals', 'Before meals']}
                    placeholder="Select frequency"
                    value={med.frequency}
                    onChange={(e) => updateMedicine(i, 'frequency', e.target.value)}
                  />
                  <Select
                    label="Duration"
                    options={['3 days', '5 days', '7 days', '10 days', '14 days', '21 days', '30 days', '60 days', '90 days', 'Ongoing']}
                    placeholder="Select duration"
                    value={med.duration}
                    onChange={(e) => updateMedicine(i, 'duration', e.target.value)}
                  />
                </div>

                <div className="mt-3">
                  <Input
                    label="Special Instructions"
                    placeholder="e.g., Take with food, avoid alcohol"
                    value={med.instructions}
                    onChange={(e) => updateMedicine(i, 'instructions', e.target.value)}
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
              <label className="block text-sm font-semibold text-text-secondary mb-2">Doctor's Advice</label>
              <textarea
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
          <Button variant="secondary" icon={Download} onClick={() => toast.success('Generating PDF...')}>
            Export PDF
          </Button>
          <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
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
