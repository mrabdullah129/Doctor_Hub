import { useState, useEffect } from 'react'
import { Calendar, Clock, CheckCircle2, Search, RefreshCw } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../store/authStore'
import useAppointmentStore from '../../store/appointmentStore'
import { formatDate } from '../../lib/utils'
import toast from 'react-hot-toast'

const statusVariant = {
  pending:          'yellow',
  payment_uploaded: 'blue',
  payment_verified: 'blue',
  confirmed:        'green',
  completed:        'gray',
  cancelled:        'red',
}

const statusLabel = {
  pending:          'Pending',
  payment_uploaded: 'Payment Uploaded',
  payment_verified: 'Payment Verified',
  confirmed:        'Confirmed',
  completed:        'Completed',
  cancelled:        'Cancelled',
}

const tabs = ['All', 'Pending', 'Confirmed', 'Completed']

export default function AssistantAppointments() {
  const { user, profile } = useAuthStore()
  const { getAllAppointments, updateStatus } = useAppointmentStore()

  const [appointments, setAppointments] = useState([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [loading, setLoading] = useState(true)

  const loadAppointments = async () => {
    setLoading(true)

    // 1. Local store — always works
    const allLocal = getAllAppointments()
    const fromStore = allLocal.map(a => ({
      id: a.id,
      supabaseId: a.supabaseId || null,
      patientId: a.patientId,
      patient: a.patientName || a.patient || 'Patient',
      doctor: a.doctor || 'Doctor',
      date: a.date,
      time: a.time,
      status: a.status,
      fee: a.fee || 0,
      reason: a.reason || 'Consultation',
      isLocal: true,
    }))

    if (fromStore.length > 0) {
      setAppointments(fromStore)
    }

    // 2. Try Supabase for real users
    if (user?.isDemo) { setLoading(false); return }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, patient:patient_id(id, full_name, phone), doctor:doctor_id(id, display_name, specialization)')
        .order('appointment_date', { ascending: true })

      if (!error && data && data.length > 0) {
        const fromSupabase = data.map(a => ({
          id: a.id,
          supabaseId: a.id,
          patientId: a.patient_id,
          patient: a.patient?.full_name || 'Patient',
          doctor: a.doctor?.display_name || 'Doctor',
          date: a.appointment_date,
          time: a.appointment_time,
          status: a.status,
          fee: Number(a.fee) || 0,
          reason: a.reason || 'Consultation',
          isLocal: false,
        }))

        // Merge: Supabase wins; keep local-only not yet synced
        const supabaseIds = new Set(fromSupabase.map(a => a.id))
        const localOnly = fromStore.filter(a => !supabaseIds.has(a.supabaseId))
        setAppointments([...fromSupabase, ...localOnly])
      }
    } catch (err) {
      console.warn('Supabase appointments fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAppointments() }, [user?.id])

  // ── Confirm appointment ───────────────────────────────────
  const confirmAppointment = async (apt) => {
    // Update local store
    if (apt.patientId) {
      updateStatus(apt.patientId, apt.id, 'confirmed')
    }

    // Optimistic UI
    setAppointments(prev =>
      prev.map(a => a.id === apt.id ? { ...a, status: 'confirmed' } : a)
    )
    toast.success(`✅ Appointment confirmed for ${apt.patient}!`)

    // Persist to Supabase
    if (!apt.isLocal && !user?.isDemo && apt.supabaseId) {
      try {
        await supabase.from('appointments')
          .update({ status: 'confirmed' })
          .eq('id', apt.supabaseId)
      } catch (err) {
        console.error('Confirm error:', err)
      }
    }
  }

  const pendingCount = appointments.filter(a =>
    ['pending', 'payment_uploaded', 'payment_verified'].includes(a.status)
  ).length

  const filtered = appointments.filter(a => {
    const matchSearch = !search ||
      a.patient.toLowerCase().includes(search.toLowerCase()) ||
      a.doctor.toLowerCase().includes(search.toLowerCase())

    const matchTab =
      activeTab === 'All'       ? true :
      activeTab === 'Pending'   ? ['pending', 'payment_uploaded', 'payment_verified'].includes(a.status) :
      activeTab === 'Confirmed' ? a.status === 'confirmed' :
      activeTab === 'Completed' ? a.status === 'completed' :
      true

    return matchSearch && matchTab
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Appointments</h1>
            <p className="text-text-muted mt-1">Manage and confirm patient appointments</p>
          </div>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-sm font-semibold text-yellow-700">{pendingCount} need confirmation</span>
              </div>
            )}
            <button onClick={loadAppointments}
              className="p-2 hover:bg-surface-100 rounded-xl text-text-muted transition-colors" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-white border border-surface-200 rounded-xl px-4 py-3 shadow-soft flex-1 max-w-sm">
            <Search className="w-4 h-4 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search patient or doctor..."
              className="flex-1 bg-transparent text-sm focus:outline-none text-text-primary placeholder-text-muted" />
          </div>
          <div className="flex items-center gap-1 bg-surface-100 rounded-xl p-1">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                  ${activeTab === tab ? 'bg-white text-primary-600 shadow-soft' : 'text-text-muted hover:text-text-primary'}`}>
                {tab}
                {tab === 'Pending' && pendingCount > 0 && (
                  <span className="ml-1.5 bg-yellow-500 text-white text-xs rounded-full px-1.5 py-0.5">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <Card>
          {loading && appointments.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="w-6 h-6 text-primary-600 animate-spin mx-auto mb-3" />
              <p className="text-text-muted text-sm">Loading appointments…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-10 h-10 text-surface-200 mx-auto mb-3" />
              <p className="text-text-muted text-sm font-medium">
                {appointments.length === 0
                  ? 'No appointments yet — waiting for patients to book'
                  : `No ${activeTab.toLowerCase()} appointments`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(apt => (
                <div key={apt.id}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-colors flex-wrap
                    ${apt.status === 'payment_verified' || apt.status === 'payment_uploaded'
                      ? 'bg-blue-50 border border-blue-100'
                      : 'bg-surface-50 hover:bg-surface-100'}`}>
                  <Avatar name={apt.patient} size="md" />

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary text-sm">{apt.patient}</p>
                    <p className="text-xs text-text-muted">{apt.doctor}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <Calendar className="w-3 h-3" />{formatDate(apt.date)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-text-muted">
                        <Clock className="w-3 h-3" />{apt.time}
                      </span>
                      {apt.reason && (
                        <span className="text-xs text-text-muted italic">• {apt.reason}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                    <span className="text-sm font-bold text-primary-600">
                      Rs {Number(apt.fee).toLocaleString()}
                    </span>
                    <Badge variant={statusVariant[apt.status] || 'gray'} dot>
                      {statusLabel[apt.status] || apt.status}
                    </Badge>

                    {/* Show Confirm for payment_verified OR payment_uploaded */}
                    {(apt.status === 'payment_verified' || apt.status === 'payment_uploaded') && (
                      <Button size="sm" icon={CheckCircle2}
                        onClick={() => confirmAppointment(apt)}>
                        Confirm
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
