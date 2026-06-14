import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar, Clock, MapPin, Search, Plus,
  CheckCircle2, XCircle, AlertCircle, RefreshCw
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../store/authStore'
import useAppointmentStore from '../../store/appointmentStore'
import { formatDate } from '../../lib/utils'

const statusVariants = {
  pending:          'yellow',
  payment_uploaded: 'blue',
  payment_verified: 'blue',
  confirmed:        'green',
  completed:        'gray',
  cancelled:        'red',
}

const statusIcons = {
  confirmed:        CheckCircle2,
  completed:        CheckCircle2,
  cancelled:        XCircle,
  pending:          AlertCircle,
  payment_uploaded: Clock,
  payment_verified: Clock,
}

const tabs = ['All', 'Upcoming', 'Completed', 'Cancelled']

export default function Appointments() {
  const { user } = useAuthStore()
  const { getAppointments } = useAppointmentStore()

  const [appointments, setAppointments] = useState([])
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const loadAppointments = async () => {
    setLoading(true)

    // ── 1. Start with local store (always available, instant) ─
    const localApts = getAppointments(user?.id || '')
    if (localApts.length > 0) {
      setAppointments(localApts)
    }

    // ── 2. Try fetching from Supabase (real users only) ───────
    if (!user || user.isDemo) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctor:doctor_id (
            id, display_name, specialization, consultation_fee, city
          )
        `)
        .eq('patient_id', user.id)
        .order('appointment_date', { ascending: false })

      if (!error && data && data.length > 0) {
        // Map Supabase rows to the same shape as local store
        const mapped = data.map(a => ({
          id: a.id,
          supabaseId: a.id,
          doctorId: a.doctor_id,
          doctor: a.doctor?.display_name || 'Doctor',
          specialty: a.doctor?.specialization || '',
          city: a.doctor?.city || '',
          date: a.appointment_date,
          time: a.appointment_time,
          status: a.status,
          fee: Number(a.fee) || Number(a.doctor?.consultation_fee) || 0,
          reason: a.reason || 'Consultation',
        }))

        // Merge: Supabase is authoritative; add local-only ones not in Supabase
        const supabaseIds = new Set(mapped.map(a => a.id))
        const localOnly = localApts.filter(a => !supabaseIds.has(a.supabaseId) && !supabaseIds.has(a.id))
        setAppointments([...mapped, ...localOnly])
      }
    } catch (err) {
      console.warn('Supabase fetch failed, using local data:', err)
      // Keep whatever we already set from local store
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [user?.id])

  const filtered = appointments.filter(apt => {
    const matchSearch = !search ||
      apt.doctor.toLowerCase().includes(search.toLowerCase()) ||
      (apt.specialty || '').toLowerCase().includes(search.toLowerCase()) ||
      (apt.reason || '').toLowerCase().includes(search.toLowerCase())

    if (activeTab === 'All')       return matchSearch
    if (activeTab === 'Upcoming')  return matchSearch && ['pending', 'payment_uploaded', 'payment_verified', 'confirmed'].includes(apt.status)
    if (activeTab === 'Completed') return matchSearch && apt.status === 'completed'
    if (activeTab === 'Cancelled') return matchSearch && apt.status === 'cancelled'
    return matchSearch
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">My Appointments</h1>
            <p className="text-text-muted mt-1">
              {appointments.length > 0
                ? `${appointments.length} appointment${appointments.length !== 1 ? 's' : ''} found`
                : 'No appointments yet'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadAppointments}
              className="p-2 hover:bg-surface-100 rounded-xl text-text-muted transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link to="/doctors">
              <Button icon={Plus}>Book New</Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-white border border-surface-200 rounded-xl px-4 py-3 shadow-soft flex-1 max-w-md">
            <Search className="w-4 h-4 text-text-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by doctor, specialty..."
              className="flex-1 bg-transparent text-sm focus:outline-none text-text-primary placeholder-text-muted"
            />
          </div>
          <div className="flex items-center gap-1 bg-surface-100 rounded-xl p-1">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-white text-primary-600 shadow-soft'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && appointments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-3">
              <RefreshCw className="w-5 h-5 text-primary-600 animate-spin" />
            </div>
            <p className="text-text-muted text-sm">Loading your appointments…</p>
          </div>
        )}

        {/* Appointments list */}
        {!loading || appointments.length > 0 ? (
          filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map(apt => {
                const StatusIcon = statusIcons[apt.status] || AlertCircle
                return (
                  <Card key={apt.id} className="hover:shadow-medium transition-all duration-300">
                    <div className="flex items-start gap-4 flex-wrap">
                      <Avatar name={apt.doctor} size="lg" />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <h3 className="font-bold text-text-primary">{apt.doctor}</h3>
                            {apt.specialty && (
                              <p className="text-sm text-text-muted">{apt.specialty}</p>
                            )}
                            {apt.reason && (
                              <p className="text-sm text-text-muted mt-0.5">{apt.reason}</p>
                            )}
                          </div>
                          <Badge variant={statusVariants[apt.status] || 'gray'} dot>
                            {apt.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>

                        <div className="flex items-center flex-wrap gap-4 mt-3">
                          <div className="flex items-center gap-1.5 text-sm text-text-muted">
                            <Calendar className="w-4 h-4" />
                            {formatDate(apt.date)}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-text-muted">
                            <Clock className="w-4 h-4" />
                            {apt.time}
                          </div>
                          {apt.city && (
                            <div className="flex items-center gap-1.5 text-sm text-text-muted">
                              <MapPin className="w-4 h-4" />
                              {apt.city}
                            </div>
                          )}
                          {apt.fee > 0 && (
                            <span className="text-sm font-bold text-primary-600">
                              Rs {Number(apt.fee).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status-based actions */}
                      {apt.status === 'payment_uploaded' && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-xl">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="text-xs font-semibold text-yellow-700">Awaiting verification</span>
                        </div>
                      )}
                      {apt.status === 'confirmed' && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary-50 border border-secondary-200 rounded-xl">
                          <CheckCircle2 className="w-4 h-4 text-secondary-600" />
                          <span className="text-xs font-semibold text-secondary-700">Confirmed</span>
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Calendar className="w-12 h-12 text-surface-200 mx-auto mb-3" />
              <p className="font-bold text-text-primary">No appointments found</p>
              <p className="text-text-muted text-sm mt-1">
                {search
                  ? 'Try a different search term'
                  : activeTab !== 'All'
                  ? `No ${activeTab.toLowerCase()} appointments`
                  : 'You have not booked any appointments yet'}
              </p>
              {!search && activeTab === 'All' && (
                <Link to="/doctors">
                  <Button className="mt-5">Find a Doctor</Button>
                </Link>
              )}
            </div>
          )
        ) : null}
      </div>
    </DashboardLayout>
  )
}
