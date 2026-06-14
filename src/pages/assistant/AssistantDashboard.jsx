import { useState, useEffect } from 'react'
import {
  CreditCard, Calendar, CheckCircle2, Clock, AlertTriangle,
  Eye, X, Check, TrendingUp, ZoomIn
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import useAuthStore from '../../store/authStore'
import useAppointmentStore from '../../store/appointmentStore'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { formatDate } from '../../lib/utils'

const DEMO_SCREENSHOT = 'https://placehold.co/400x200/e2e8f0/64748b?text=Payment+Receipt'

const activityData = [
  { day: 'Mon', verified: 8, rejected: 1 },
  { day: 'Tue', verified: 12, rejected: 2 },
  { day: 'Wed', verified: 6, rejected: 0 },
  { day: 'Thu', verified: 15, rejected: 3 },
  { day: 'Fri', verified: 10, rejected: 1 },
  { day: 'Sat', verified: 14, rejected: 2 },
  { day: 'Sun', verified: 5, rejected: 0 },
]

export default function AssistantDashboard() {
  const { profile, user } = useAuthStore()
  const { getAllAppointments, updateStatus } = useAppointmentStore()
  const [payments, setPayments] = useState([])
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [imgZoomed, setImgZoomed] = useState(false)
  const [verifiedCount, setVerifiedCount] = useState(0)
  const [rejectedCount, setRejectedCount] = useState(0)

  // ── Load pending payments from store + Supabase ──────────
  useEffect(() => {
    loadPendingPayments()
  }, [user?.id])

  const loadPendingPayments = async () => {
    // 1. From local store
    const allLocal = getAllAppointments()
    const pendingLocal = allLocal
      .filter(a => a.status === 'payment_uploaded' || a.status === 'pending')
      .map(a => ({
        id: 'pay-' + a.id,
        appointmentId: a.id,
        patientId: a.patientId,
        patient: a.patientName || a.patient || 'Patient',
        doctor: a.doctor || 'Doctor',
        amount: a.fee || 0,
        date: a.createdAt || a.date,
        appointmentDate: a.date,
        time: a.time,
        screenshotUrl: a.paymentScreenshot || DEMO_SCREENSHOT,
        screenshotName: 'payment_receipt.jpg',
        isLocal: true,
      }))

    if (pendingLocal.length > 0) {
      setPayments(pendingLocal)
    }

    if (user?.isDemo) return

    // 2. Try Supabase
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`*, appointment:appointment_id (
          id, appointment_date, appointment_time, fee, status,
          patient:patient_id ( id, full_name ),
          doctor:doctor_id ( id, display_name )
        )`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        const fromDB = data.map(p => ({
          id: p.id,
          appointmentId: p.appointment_id,
          patientId: p.appointment?.patient?.id,
          patient: p.appointment?.patient?.full_name || 'Patient',
          doctor: p.appointment?.doctor?.display_name || 'Doctor',
          amount: Number(p.amount) || 0,
          date: p.created_at,
          appointmentDate: p.appointment?.appointment_date,
          time: p.appointment?.appointment_time,
          screenshotUrl: p.screenshot_url || DEMO_SCREENSHOT,
          screenshotName: 'payment_receipt.jpg',
          isLocal: false,
        }))
        const dbAptIds = new Set(fromDB.map(p => p.appointmentId))
        const localOnly = pendingLocal.filter(p => !dbAptIds.has(p.appointmentId))
        setPayments([...fromDB, ...localOnly])
      }
    } catch (err) {
      console.warn('Supabase payments load failed:', err)
    }
  }

  const stats = [
    { label: 'Pending Verification', value: payments.length.toString(), icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Verified Today', value: String(12 + verifiedCount), icon: CheckCircle2, color: 'text-secondary-500 bg-secondary-50' },
    { label: 'Total Appointments', value: '45', icon: Calendar, color: 'text-primary-600 bg-primary-50' },
    { label: "Today's Revenue", value: `Rs ${(24000 + verifiedCount * 2000).toLocaleString()}`, icon: TrendingUp, color: 'text-teal-600 bg-teal-50' },
  ]

  const openReview = (payment) => {
    setSelectedPayment(payment)
    setImgZoomed(false)
    setModalOpen(true)
  }

  const handleVerify = async (id) => {
    const payment = payments.find(p => p.id === id)

    setPayments(prev => prev.filter(p => p.id !== id))
    setVerifiedCount(c => c + 1)
    setModalOpen(false)
    setSelectedPayment(null)
    toast.success('✅ Payment verified! Appointment confirmed.')

    // Update local store so patient + doctor see confirmed status
    if (payment?.patientId && payment?.appointmentId) {
      updateStatus(payment.patientId, payment.appointmentId, 'confirmed')
    }

    if (!payment?.isLocal && !user?.isDemo) {
      try {
        await supabase.from('payments').update({
          status: 'verified',
          verified_by: profile?.id || null,
          verified_at: new Date().toISOString(),
        }).eq('id', id)
        if (payment?.appointmentId) {
          await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', payment.appointmentId)
        }
      } catch (err) { console.error('Verify error:', err) }
    }
  }

  const handleReject = async (id) => {
    const payment = payments.find(p => p.id === id)

    setPayments(prev => prev.filter(p => p.id !== id))
    setRejectedCount(c => c + 1)
    setModalOpen(false)
    setSelectedPayment(null)
    toast.error('❌ Payment rejected. Patient will be notified.')

    if (payment?.patientId && payment?.appointmentId) {
      updateStatus(payment.patientId, payment.appointmentId, 'cancelled')
    }

    if (!payment?.isLocal && !user?.isDemo) {
      try {
        await supabase.from('payments').update({ status: 'rejected' }).eq('id', id)
        if (payment?.appointmentId) {
          await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', payment.appointmentId)
        }
      } catch (err) { console.error('Reject error:', err) }
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Assistant Dashboard 👋</h1>
          <p className="text-text-muted mt-1">
            {payments.length > 0
              ? `${payments.length} payment${payments.length !== 1 ? 's' : ''} awaiting verification`
              : 'All payments verified — great work!'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                <p className="text-xs font-semibold text-text-secondary mt-0.5">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Payment Queue */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Payment Verification Queue</CardTitle>
                  <p className="text-sm text-text-muted mt-0.5">{payments.length} pending</p>
                </div>
              </CardHeader>

              {payments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-3xl bg-secondary-50 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-secondary-500" />
                  </div>
                  <p className="font-bold text-text-primary">All caught up!</p>
                  <p className="text-text-muted text-sm mt-1">No pending payments to verify</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment.id}
                      className="flex items-center gap-4 p-4 bg-surface-50 rounded-xl hover:bg-surface-100 transition-colors">
                      <Avatar name={payment.patient} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-primary text-sm">{payment.patient}</p>
                        <p className="text-xs text-text-muted">{payment.doctor}</p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {formatDate(payment.appointmentDate)} • {payment.time}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-text-primary">Rs {payment.amount.toLocaleString()}</p>
                        <Badge variant="yellow" className="mt-1">Pending</Badge>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => openReview(payment)}>
                        <Eye className="w-4 h-4" />
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <Card>
              <CardTitle className="mb-4">Today's Summary</CardTitle>
              <div className="space-y-3">
                {[
                  { label: 'Payments Verified', value: 12 + verifiedCount, icon: CheckCircle2, color: 'text-secondary-500 bg-secondary-50' },
                  { label: 'Payments Rejected', value: 2 + rejectedCount, icon: X, color: 'text-red-500 bg-red-50' },
                  { label: 'Appointments Confirmed', value: 12 + verifiedCount, icon: Calendar, color: 'text-primary-600 bg-primary-50' },
                  { label: 'Pending in Queue', value: payments.length, icon: AlertTriangle, color: 'text-yellow-600 bg-yellow-50' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-text-secondary font-medium">{item.label}</span>
                    </div>
                    <span className="text-lg font-bold text-text-primary">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader><CardTitle>Weekly Activity</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="verifiedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="verified" name="Verified" stroke="#10b981" strokeWidth={2} fill="url(#verifiedGrad)" />
              <Area type="monotone" dataKey="rejected" name="Rejected" stroke="#ef4444" strokeWidth={2} fill="none" strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Payment Review Modal ────────────────────────────── */}
        <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setSelectedPayment(null) }}
          title="Review Payment" size="md">
          {selectedPayment && (
            <div className="space-y-4">
              {/* Details grid — compact 3-col */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Patient',   value: selectedPayment.patient },
                  { label: 'Doctor',    value: selectedPayment.doctor },
                  { label: 'Amount',    value: `Rs ${selectedPayment.amount.toLocaleString()}` },
                  { label: 'Appt Date', value: formatDate(selectedPayment.appointmentDate) },
                  { label: 'Time',      value: selectedPayment.time },
                  { label: 'Submitted', value: formatDate(selectedPayment.date) },
                ].map(r => (
                  <div key={r.label} className="p-2.5 bg-surface-50 rounded-xl">
                    <p className="text-[10px] text-text-muted uppercase tracking-wide">{r.label}</p>
                    <p className="font-semibold text-text-primary text-xs mt-0.5 truncate">{r.value}</p>
                  </div>
                ))}
              </div>

              {/* Screenshot — fixed small height, click to zoom */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-text-secondary">Payment Screenshot</p>
                  <button
                    onClick={() => setImgZoomed(z => !z)}
                    className="flex items-center gap-1 text-[11px] text-primary-600 hover:underline font-medium"
                  >
                    <ZoomIn className="w-3 h-3" />
                    {imgZoomed ? 'Zoom out' : 'Zoom in'}
                  </button>
                </div>
                <div className={`rounded-xl overflow-hidden border border-surface-200 transition-all duration-300 ${imgZoomed ? 'max-h-64' : 'max-h-28'}`}>
                  <img
                    src={selectedPayment.screenshotUrl}
                    alt="Payment receipt"
                    className="w-full object-cover cursor-zoom-in"
                    onClick={() => setImgZoomed(z => !z)}
                  />
                </div>
                <p className="text-[10px] text-text-muted mt-1">📎 {selectedPayment.screenshotName}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button variant="danger" className="flex-1 text-sm py-2.5" icon={X}
                  onClick={() => handleReject(selectedPayment.id)}>
                  Reject
                </Button>
                <Button variant="success" className="flex-1 text-sm py-2.5" icon={Check}
                  onClick={() => handleVerify(selectedPayment.id)}>
                  Verify & Confirm
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
}
