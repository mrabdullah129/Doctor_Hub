import { useState, useEffect } from 'react'
import { CreditCard, Eye, Check, X, Search, RefreshCw } from 'lucide-react'
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

const DEMO_SCREENSHOT = 'https://placehold.co/400x200/e2e8f0/64748b?text=Payment+Receipt'

export default function PaymentQueue() {
  const { user, profile } = useAuthStore()
  const { getAllAppointments, updateStatus } = useAppointmentStore()

  const [payments, setPayments] = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('pending')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // ── Build payment list from store + Supabase ─────────────
  const loadPayments = async () => {
    setLoading(true)

    // 1. Get all appointments from local store (works offline/demo)
    const allLocal = getAllAppointments()
    const fromStore = allLocal.map(a => ({
      id: 'pay-' + a.id,
      appointmentId: a.id,
      patientId: a.patientId,
      patient: a.patientName || a.patient || 'Patient',
      doctor: a.doctor || 'Doctor',
      amount: a.fee || 0,
      date: a.createdAt || a.date,
      appointmentDate: a.date,
      time: a.time,
      status: a.paymentStatus || (
        a.status === 'confirmed' ? 'verified' :
        a.status === 'cancelled' ? 'rejected' :
        'pending'
      ),
      screenshotUrl: a.paymentScreenshot || DEMO_SCREENSHOT,
      screenshotName: 'payment_receipt.jpg',
      isLocal: true,
    }))

    if (fromStore.length > 0) {
      setPayments(fromStore)
    }

    // 2. Try Supabase for real users
    if (user?.isDemo) {
      setLoading(false)
      return
    }

    try {
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
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        const fromSupabase = data.map(p => ({
          id: p.id,
          appointmentId: p.appointment_id,
          patientId: p.appointment?.patient?.id,
          patient: p.appointment?.patient?.full_name || 'Patient',
          doctor: p.appointment?.doctor?.display_name || 'Doctor',
          amount: Number(p.amount) || Number(p.appointment?.fee) || 0,
          date: p.created_at,
          appointmentDate: p.appointment?.appointment_date,
          time: p.appointment?.appointment_time,
          status: p.status || 'pending',
          screenshotUrl: p.screenshot_url || DEMO_SCREENSHOT,
          screenshotName: 'payment_receipt.jpg',
          isLocal: false,
        }))

        // Merge: Supabase wins; keep local-only ones not yet in DB
        const supabaseAptIds = new Set(fromSupabase.map(p => p.appointmentId))
        const localOnly = fromStore.filter(p => !supabaseAptIds.has(p.appointmentId))
        setPayments([...fromSupabase, ...localOnly])
      }
    } catch (err) {
      console.warn('Supabase payments fetch failed, using local data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayments()
  }, [user?.id])

  // ── Verify ────────────────────────────────────────────────
  const verify = async (paymentId) => {
    const payment = payments.find(p => p.id === paymentId)

    // Optimistic UI
    setPayments(ps => ps.map(p =>
      p.id === paymentId ? { ...p, status: 'verified' } : p
    ))
    setSelected(null)
    toast.success('✅ Payment verified! Appointment confirmed.')

    // Update local store so doctor + patient see the updated status
    if (payment?.patientId && payment?.appointmentId) {
      updateStatus(payment.patientId, payment.appointmentId, 'confirmed')
    }

    // Persist to Supabase for real payments
    if (!payment?.isLocal && !user?.isDemo) {
      try {
        await supabase.from('payments').update({
          status: 'verified',
          verified_by: profile?.id || null,
          verified_at: new Date().toISOString(),
        }).eq('id', paymentId)

        if (payment?.appointmentId) {
          await supabase.from('appointments')
            .update({ status: 'confirmed' })
            .eq('id', payment.appointmentId)
        }
      } catch (err) {
        console.error('Supabase verify error:', err)
      }
    }
  }

  // ── Reject ────────────────────────────────────────────────
  const reject = async (paymentId) => {
    const payment = payments.find(p => p.id === paymentId)

    setPayments(ps => ps.map(p =>
      p.id === paymentId ? { ...p, status: 'rejected' } : p
    ))
    setSelected(null)
    toast.error('❌ Payment rejected.')

    if (payment?.patientId && payment?.appointmentId) {
      updateStatus(payment.patientId, payment.appointmentId, 'cancelled')
    }

    if (!payment?.isLocal && !user?.isDemo) {
      try {
        await supabase.from('payments').update({ status: 'rejected' }).eq('id', paymentId)
        if (payment?.appointmentId) {
          await supabase.from('appointments')
            .update({ status: 'cancelled' })
            .eq('id', payment.appointmentId)
        }
      } catch (err) {
        console.error('Supabase reject error:', err)
      }
    }
  }

  const statusVariant = { pending: 'yellow', verified: 'green', rejected: 'red' }

  const filtered = payments.filter(p =>
    (filter === 'all' || p.status === filter) &&
    (!search || p.patient.toLowerCase().includes(search.toLowerCase()) ||
      p.doctor.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Payment Queue</h1>
            <p className="text-text-muted mt-1">Review and verify patient payment screenshots</p>
          </div>
          <button
            onClick={loadPayments}
            className="p-2 hover:bg-surface-100 rounded-xl text-text-muted transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
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
            {['all', 'pending', 'verified', 'rejected'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
                  ${filter === f ? 'bg-white text-primary-600 shadow-soft' : 'text-text-muted hover:text-text-primary'}`}>
                {f}
                {f === 'pending' && payments.filter(p => p.status === 'pending').length > 0 && (
                  <span className="ml-1.5 bg-yellow-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {payments.filter(p => p.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <Card>
          {loading && payments.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="w-6 h-6 text-primary-600 animate-spin mx-auto mb-3" />
              <p className="text-text-muted text-sm">Loading payments…</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200">
                    {['Patient', 'Doctor', 'Appointment', 'Amount', 'Status', 'Action'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider pb-3 pr-6">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {filtered.map(p => (
                    <tr key={p.id} className="hover:bg-surface-50 transition-colors">
                      <td className="py-4 pr-6">
                        <div className="flex items-center gap-3">
                          <Avatar name={p.patient} size="sm" />
                          <span className="font-semibold text-text-primary text-sm">{p.patient}</span>
                        </div>
                      </td>
                      <td className="py-4 pr-6 text-sm text-text-muted">{p.doctor}</td>
                      <td className="py-4 pr-6 text-sm text-text-secondary whitespace-nowrap">
                        {p.appointmentDate ? formatDate(p.appointmentDate) : '—'} • {p.time || '—'}
                      </td>
                      <td className="py-4 pr-6 text-sm font-bold text-text-primary">
                        Rs {Number(p.amount).toLocaleString()}
                      </td>
                      <td className="py-4 pr-6">
                        <Badge variant={statusVariant[p.status] || 'yellow'} dot>{p.status}</Badge>
                      </td>
                      <td className="py-4">
                        {p.status === 'pending' ? (
                          <Button size="sm" variant="ghost" onClick={() => setSelected(p)}>
                            <Eye className="w-4 h-4" /> Review
                          </Button>
                        ) : (
                          <span className="text-xs text-text-muted capitalize">{p.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <CreditCard className="w-10 h-10 text-surface-200 mx-auto mb-3" />
                  <p className="text-text-muted text-sm font-medium">
                    {payments.length === 0
                      ? 'No payments yet — waiting for patients to book appointments'
                      : `No ${filter} payments`}
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Review Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Review Payment" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Patient',  value: selected.patient },
                { label: 'Doctor',   value: selected.doctor },
                { label: 'Amount',   value: `Rs ${Number(selected.amount).toLocaleString()}` },
                { label: 'Date',     value: selected.appointmentDate ? formatDate(selected.appointmentDate) : '—' },
                { label: 'Time',     value: selected.time || '—' },
                { label: 'Submitted', value: formatDate(selected.date) },
              ].map(r => (
                <div key={r.label} className="p-2.5 bg-surface-50 rounded-xl">
                  <p className="text-[10px] text-text-muted uppercase tracking-wide">{r.label}</p>
                  <p className="font-semibold text-text-primary text-xs mt-0.5 truncate">{r.value}</p>
                </div>
              ))}
            </div>

            {/* Screenshot */}
            <div className="rounded-xl overflow-hidden border border-surface-200">
              <img
                src={selected.screenshotUrl}
                alt="Payment receipt"
                className="w-full object-contain max-h-40 bg-surface-50"
                onError={e => { e.target.src = DEMO_SCREENSHOT }}
              />
            </div>
            <p className="text-[10px] text-text-muted">📎 {selected.screenshotName}</p>

            <div className="flex gap-2">
              <Button variant="danger" className="flex-1" icon={X}
                onClick={() => reject(selected.id)}>Reject</Button>
              <Button variant="success" className="flex-1" icon={Check}
                onClick={() => verify(selected.id)}>Verify & Confirm</Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}
