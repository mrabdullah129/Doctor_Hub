import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar, Clock, CheckCircle2, MessageSquare, Pill,
  FileText, Stethoscope, Phone, RefreshCw
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../store/authStore'
import useAppointmentStore from '../../store/appointmentStore'
import { formatDate } from '../../lib/utils'
import toast from 'react-hot-toast'

const tabs = ['Today', 'Upcoming', 'All']

// ── Start Consultation Modal ──────────────────────────────────────────────────
function StartModal({ apt, onClose, onComplete }) {
  const [notes, setNotes] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [completing, setCompleting] = useState(false)

  const handleComplete = async () => {
    if (!diagnosis.trim()) { toast.error('Please enter a diagnosis'); return }
    setCompleting(true)
    await new Promise(r => setTimeout(r, 600))
    setCompleting(false)
    onComplete(apt.id)
    toast.success(`Consultation with ${apt.patient} completed!`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl border border-primary-100">
        <Avatar name={apt.patient} size="md" />
        <div className="flex-1">
          <p className="font-bold text-text-primary">{apt.patient}</p>
          <p className="text-xs text-text-muted">{apt.time} • {apt.reason}</p>
        </div>
        {apt.phone && (
          <a href={`tel:${apt.phone}`} className="p-2 hover:bg-primary-100 rounded-lg text-primary-600 transition-colors">
            <Phone className="w-4 h-4" />
          </a>
        )}
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1.5">
          Diagnosis <span className="text-red-500">*</span>
        </label>
        <input value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
          placeholder="e.g., Hypertension Stage 1"
          className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-1.5">Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Patient symptoms, observations, plan..."
          rows={3} className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
      </div>
      <div className="flex gap-2 pt-1">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button variant="success" className="flex-1" icon={CheckCircle2} loading={completing} onClick={handleComplete}>
          Complete Consultation
        </Button>
      </div>
    </div>
  )
}

export default function DoctorAppointments() {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const { getAllAppointments, updateStatus } = useAppointmentStore()

  const [appointments, setAppointments] = useState([])
  const [activeTab, setActiveTab] = useState('Today')
  const [startModal, setStartModal] = useState(null)
  const [viewModal, setViewModal] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadAppointments = async () => {
    setLoading(true)

    // ── 1. From local store — appointments booked for this doctor ──
    const all = getAllAppointments()
    // Filter appointments where the doctor matches the logged-in doctor
    const doctorName = (profile?.full_name || '').toLowerCase().trim()
    const forThisDoctor = all.filter(a =>
      (a.doctor || '').toLowerCase().trim() === doctorName ||
      String(a.doctorId) === String(profile?.id) ||
      String(a.doctorProfileId) === String(profile?.id)
    )

    const fromStore = forThisDoctor.map(a => ({
      id: a.id,
      supabaseId: a.supabaseId || null,
      patientId: a.patientId,
      patient: a.patientName || a.patient || (a.patientEmail ? a.patientEmail.split('@')[0] : 'Patient'),
      age: a.age || 0,
      phone: a.phone || '',
      reason: a.reason || 'Consultation',
      date: a.date,
      time: a.time,
      status: a.status,
      fee: a.fee || 0,
      isLocal: true,
    }))

    if (fromStore.length > 0) setAppointments(fromStore)

    // ── 2. Supabase for real users ─────────────────────────────────
    if (user?.isDemo) { setLoading(false); return }

    try {
      // Get this doctor's row
      const { data: doctorRow } = await supabase
        .from('doctors').select('id').eq('profile_id', profile.id).single()

      if (!doctorRow) { setLoading(false); return }

      const { data, error } = await supabase
        .from('appointments')
        .select('*, patient:patient_id(id, full_name, phone, email)')
        .eq('doctor_id', doctorRow.id)
        .order('appointment_date', { ascending: true })

      if (!error && data && data.length > 0) {
        const fromDB = data.map(a => ({
          id: a.id,
          supabaseId: a.id,
          patientId: a.patient_id,
          patient: a.patient?.full_name || 'Patient',
          age: 0,
          phone: a.patient?.phone || '',
          reason: a.reason || 'Consultation',
          date: a.appointment_date,
          time: a.appointment_time,
          status: a.status,
          fee: Number(a.fee) || 0,
          isLocal: false,
        }))

        // Merge: DB wins, add local-only not yet in DB
        const dbIds = new Set(fromDB.map(a => a.id))
        const localOnly = fromStore.filter(a => !dbIds.has(a.supabaseId))
        setAppointments([...fromDB, ...localOnly])
      }
    } catch (err) {
      console.warn('Doctor appointments load failed:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAppointments() }, [profile?.id])

  const handleComplete = async (id) => {
    const apt = appointments.find(a => a.id === id)
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'completed' } : a))
    setStartModal(null)

    if (apt?.patientId) updateStatus(apt.patientId, id, 'completed')

    if (!user?.isDemo && apt?.supabaseId) {
      try { await supabase.from('appointments').update({ status: 'completed' }).eq('id', apt.supabaseId) }
      catch (err) { console.error(err) }
    }
  }

  const handleMessage = (apt) => { navigate('/doctor/messages'); toast.success(`Opening chat with ${apt.patient}`) }
  const handlePrescribe = (apt) => { navigate('/doctor/prescriptions'); toast.success(`Creating prescription for ${apt.patient}`) }

  const filtered = appointments.filter(apt => {
    const today = new Date().toDateString()
    const aptDate = new Date(apt.date).toDateString()
    if (activeTab === 'Today')    return aptDate === today
    if (activeTab === 'Upcoming') return new Date(apt.date) >= new Date()
    return true
  })

  const statusVariant = { confirmed: 'green', pending: 'yellow', completed: 'gray', cancelled: 'red', payment_uploaded: 'blue', payment_verified: 'blue' }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Appointments</h1>
            <p className="text-text-muted mt-1">Your patient appointment queue</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadAppointments}
              className="p-2 hover:bg-surface-100 rounded-xl text-text-muted transition-colors" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="flex items-center gap-1 bg-surface-100 rounded-xl p-1">
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-white text-primary-600 shadow-soft' : 'text-text-muted hover:text-text-primary'}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && appointments.length === 0 ? (
          <div className="text-center py-16">
            <RefreshCw className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-3" />
            <p className="text-text-muted text-sm">Loading appointments…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-surface-200 mx-auto mb-3" />
            <p className="font-bold text-text-primary">No appointments</p>
            <p className="text-text-muted text-sm mt-1">
              {appointments.length === 0
                ? 'No patients have booked with you yet'
                : `No ${activeTab.toLowerCase()} appointments`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(apt => (
              <Card key={apt.id} className={`hover:shadow-medium transition-all ${apt.status === 'completed' ? 'opacity-70' : ''}`}>
                <div className="flex items-center gap-4 flex-wrap">
                  <Avatar name={apt.patient} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-text-primary">{apt.patient}</h3>
                      {apt.age > 0 && <span className="text-sm text-text-muted">Age {apt.age}</span>}
                      <Badge variant={statusVariant[apt.status] || 'gray'} dot>
                        {apt.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-muted mt-0.5">{apt.reason}</p>
                    <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <Calendar className="w-3 h-3" />{formatDate(apt.date)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <Clock className="w-3 h-3" />{apt.time}
                      </span>
                      {apt.fee > 0 && (
                        <span className="text-xs font-bold text-primary-600">Rs {Number(apt.fee).toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button title="Message patient" onClick={() => handleMessage(apt)}
                      className="p-2 hover:bg-primary-50 text-text-muted hover:text-primary-600 rounded-xl transition-colors">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button title="View details" onClick={() => setViewModal(apt)}
                      className="p-2 hover:bg-surface-100 text-text-muted hover:text-text-primary rounded-xl transition-colors">
                      <FileText className="w-4 h-4" />
                    </button>

                    {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                      <>
                        <Button variant="secondary" size="sm" icon={Pill} onClick={() => handlePrescribe(apt)}>Prescribe</Button>
                        <Button size="sm" icon={Stethoscope}
                          disabled={apt.status === 'pending' || apt.status === 'payment_uploaded'}
                          onClick={() => setStartModal(apt)}
                          title={apt.status === 'pending' ? 'Awaiting payment verification' : 'Start consultation'}>
                          Start
                        </Button>
                      </>
                    )}
                    {apt.status === 'completed' && (
                      <span className="flex items-center gap-1 text-xs text-secondary-600 font-semibold bg-secondary-50 px-3 py-1.5 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Done
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Start Modal */}
      <Modal isOpen={!!startModal} onClose={() => setStartModal(null)} title="Start Consultation" size="md">
        {startModal && <StartModal apt={startModal} onClose={() => setStartModal(null)} onComplete={handleComplete} />}
      </Modal>

      {/* View Modal */}
      <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="Appointment Details" size="md">
        {viewModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
              <Avatar name={viewModal.patient} size="lg" />
              <div>
                <p className="font-bold text-text-primary text-lg">{viewModal.patient}</p>
                {viewModal.phone && <p className="text-sm text-text-muted">{viewModal.phone}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Reason',  value: viewModal.reason },
                { label: 'Status',  value: viewModal.status.replace(/_/g, ' ') },
                { label: 'Date',    value: formatDate(viewModal.date) },
                { label: 'Time',    value: viewModal.time },
                { label: 'Fee',     value: viewModal.fee > 0 ? `Rs ${Number(viewModal.fee).toLocaleString()}` : '—' },
              ].map(r => (
                <div key={r.label} className="p-3 bg-surface-50 rounded-xl">
                  <p className="text-xs text-text-muted">{r.label}</p>
                  <p className="font-semibold text-text-primary text-sm mt-0.5 capitalize">{r.value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="secondary" className="flex-1" icon={MessageSquare}
                onClick={() => { setViewModal(null); handleMessage(viewModal) }}>Message</Button>
              <Button className="flex-1" icon={Pill}
                onClick={() => { setViewModal(null); handlePrescribe(viewModal) }}>Prescribe</Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}
