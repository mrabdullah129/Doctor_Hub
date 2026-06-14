import { useEffect, useState } from 'react'
import { Pill, Download, Printer, Calendar, Lock, Search } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { formatDate } from '../../lib/utils'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import { getPatientPrescriptions } from '../../lib/dataService'
import PropTypes from 'prop-types'
import { downloadPrescriptionPdf } from '../../lib/prescriptionPdf'

const DEMO_PRESCRIPTIONS = [
  {
    id: 1,
    doctor: 'Dr. Sarah Ahmed',
    specialty: 'Cardiologist',
    date: new Date(Date.now() - 86400000 * 7).toISOString(),
    diagnosis: 'Hypertension Stage 1',
    medicines: [
      { name: 'Lisinopril', strength: '10mg', form: 'Tablet', dosage: '1 tablet', frequency: 'Once daily (morning)', duration: '30 days', instructions: 'Take with water, preferably at the same time each day' },
      { name: 'Amlodipine', strength: '5mg', form: 'Tablet', dosage: '1 tablet', frequency: 'Once daily (evening)', duration: '30 days', instructions: 'Avoid grapefruit juice' },
    ],
    advice: 'Low salt diet. Daily exercise 30 minutes. Monitor BP twice daily.',
    followUp: '4 weeks',
    status: 'active',
  },
  {
    id: 2,
    doctor: 'Dr. Hassan Khan',
    specialty: 'General Physician',
    date: new Date(Date.now() - 86400000 * 30).toISOString(),
    diagnosis: 'Acute Bronchitis',
    medicines: [
      { name: 'Amoxicillin', strength: '500mg', form: 'Capsule', dosage: '1 capsule', frequency: 'Twice daily', duration: '7 days', instructions: 'Complete full course even if feeling better' },
      { name: 'Salbutamol', strength: '100mcg/dose', form: 'Inhaler', dosage: '2 puffs', frequency: 'As needed (max 4x/day)', duration: '14 days', instructions: 'Shake before use. Rinse mouth after use.' },
    ],
    advice: 'Rest. Plenty of fluids. Avoid cold air.',
    followUp: 'If symptoms persist after 7 days',
    status: 'completed',
  },
]

function PrescriptionDetail({ prescription }) {
  if (!prescription) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-primary-200 text-xs font-semibold uppercase tracking-wider mb-1">Digital Prescription</p>
            <h2 className="text-xl font-bold">DoctorHub Medical Center</h2>
            <p className="text-primary-200 text-sm mt-1">Rx #{prescription.id.toString().padStart(6, '0')}</p>
          </div>
          <div className="text-right">
            <p className="text-primary-200 text-xs">Issued Date</p>
            <p className="font-bold">{formatDate(prescription.date)}</p>
          </div>
        </div>
      </div>

      {/* Doctor & Patient info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-surface-50 rounded-xl">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Prescribing Doctor</p>
          <p className="font-bold text-text-primary">{prescription.doctor}</p>
          <p className="text-sm text-text-muted">{prescription.specialty}</p>
        </div>
        <div className="p-4 bg-surface-50 rounded-xl">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Diagnosis</p>
          <p className="font-bold text-text-primary">{prescription.diagnosis}</p>
        </div>
      </div>

      {/* Medicines */}
      <div>
        <p className="text-sm font-bold text-text-primary mb-3">Prescribed Medicines</p>
        <div className="space-y-3">
          {prescription.medicines.map((med) => (
            <div key={`${med.name}-${med.strength}-${med.dosage}`} className="border border-surface-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 p-4 bg-surface-50">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <Pill className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-text-primary">{med.name} <span className="text-text-muted font-normal">{med.strength}</span></p>
                  <p className="text-xs text-text-muted capitalize">{med.form}</p>
                </div>
                <Badge variant="blue">{med.duration}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 p-4">
                <div>
                  <p className="text-xs text-text-muted mb-0.5">Dosage</p>
                  <p className="text-sm font-semibold text-text-primary">{med.dosage}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-0.5">Frequency</p>
                  <p className="text-sm font-semibold text-text-primary">{med.frequency}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-0.5">Duration</p>
                  <p className="text-sm font-semibold text-text-primary">{med.duration}</p>
                </div>
              </div>
              {med.instructions && (
                <div className="px-4 pb-4">
                  <p className="text-xs text-text-muted bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2">
                    ⚠ {med.instructions}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Advice */}
      <div className="p-4 bg-secondary-50 rounded-xl border border-secondary-100">
        <p className="text-sm font-semibold text-secondary-700 mb-1">Doctor's Advice</p>
        <p className="text-sm text-secondary-600">{prescription.advice}</p>
      </div>

      {/* Follow-up */}
      <div className="flex items-center justify-between p-4 bg-surface-50 rounded-xl">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-text-muted" />
          <span className="text-sm text-text-secondary font-medium">Follow-up</span>
        </div>
        <span className="text-sm font-bold text-text-primary">{prescription.followUp}</span>
      </div>

      {/* Immutable notice */}
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <Lock className="w-3.5 h-3.5" />
        This prescription is digitally sealed and cannot be modified.
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => downloadPrescriptionPdf(prescription, { filename: `prescription-${prescription.id}.pdf` })}
        >
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
        <Button className="flex-1" onClick={() => globalThis.print()}>
          <Printer className="w-4 h-4" />
          Print
        </Button>
      </div>
    </div>
  )
}

PrescriptionDetail.propTypes = {
  prescription: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    date: PropTypes.string.isRequired,
    doctor: PropTypes.string,
    specialty: PropTypes.string,
    diagnosis: PropTypes.string.isRequired,
    medicines: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        strength: PropTypes.string,
        form: PropTypes.string,
        dosage: PropTypes.string,
        frequency: PropTypes.string,
        duration: PropTypes.string,
        instructions: PropTypes.string,
      })
    ).isRequired,
    advice: PropTypes.string,
    followUp: PropTypes.string,
  }).isRequired,
}

export default function Prescriptions() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [prescriptions, setPrescriptions] = useState([])
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (user?.isDemo) {
        setPrescriptions(DEMO_PRESCRIPTIONS)
        return
      }
      if (!profile?.id) return
      try {
        const data = await getPatientPrescriptions(profile.id)
        if (!mounted) return
        setPrescriptions(data)
      } catch (err) {
        toast.error(err.message || 'Failed to load prescriptions')
      } finally {
        if (mounted) {
          // no-op: loading state removed
        }
      }
    }
    load()
    return () => { mounted = false }
  }, [profile, user])

  const filtered = prescriptions.filter((p) =>
    (p.doctor || p.doctor_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.diagnosis || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Prescriptions</h1>
            <p className="text-text-muted mt-1">All your digital prescriptions in one place</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-xl">
            <Lock className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-700 font-medium">Immutable records</span>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-surface-200 rounded-xl px-4 py-3 shadow-soft max-w-md">
          <Search className="w-4 h-4 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by doctor or diagnosis..."
            className="flex-1 bg-transparent text-sm focus:outline-none text-text-primary placeholder-text-muted"
          />
        </div>

        {/* Prescriptions list */}
        <div className="space-y-4">
          {filtered.map((rx) => (
            <Card key={rx.id} className="hover:shadow-medium transition-all duration-300">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-4">
                  <Avatar name={rx.doctor} size="md" />
                  <div>
                    <h3 className="font-bold text-text-primary">{rx.diagnosis}</h3>
                    <p className="text-sm text-text-muted">{rx.doctor} • {rx.specialty}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <Calendar className="w-3 h-3" />
                        {formatDate(rx.date)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <Pill className="w-3 h-3" />
                        {rx.medicines.length} medicine{rx.medicines.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={rx.status === 'active' ? 'green' : 'gray'} dot>
                    {rx.status}
                  </Badge>
                  <Button size="sm" variant="secondary" onClick={() => setSelected(rx)}>
                    View Prescription
                  </Button>
                </div>
              </div>

              {/* Medicines preview */}
              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-surface-100">
                {rx.medicines.map((med) => (
                  <span key={`${med.name}-${med.strength}-${med.dosage}`} className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs px-2.5 py-1 rounded-full font-medium">
                    <Pill className="w-3 h-3" />
                    {med.name} {med.strength}
                  </span>
                ))}
              </div>
            </Card>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Pill className="w-12 h-12 text-surface-200 mx-auto mb-3" />
              <p className="font-bold text-text-primary">No prescriptions found</p>
              <p className="text-text-muted text-sm mt-1">Prescriptions will appear here after doctor visits</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Prescription" size="lg">
        <PrescriptionDetail prescription={selected} onClose={() => setSelected(null)} />
      </Modal>
    </DashboardLayout>
  )
}
