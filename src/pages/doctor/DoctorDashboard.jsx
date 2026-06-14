import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar, Users, TrendingUp, Clock, CheckCircle2,
  AlertCircle, ArrowRight, Pill, BarChart3, Activity
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import useAuthStore from '../../store/authStore'
import useAppointmentStore from '../../store/appointmentStore'
import { formatDate } from '../../lib/utils'

const monthlyData = [
  { month: 'Jan', patients: 35, revenue: 70000 },
  { month: 'Feb', patients: 42, revenue: 84000 },
  { month: 'Mar', patients: 38, revenue: 76000 },
  { month: 'Apr', patients: 55, revenue: 110000 },
  { month: 'May', patients: 48, revenue: 96000 },
  { month: 'Jun', patients: 62, revenue: 124000 },
]

const statusVariants = { confirmed: 'green', pending: 'yellow', completed: 'gray', cancelled: 'red', payment_uploaded: 'blue', payment_verified: 'blue' }

export default function DoctorDashboard() {
  const { profile } = useAuthStore()
  const { getAllAppointments } = useAppointmentStore()

  // Get real appointments for this doctor
  const myAppointments = useMemo(() => {
    const all = getAllAppointments()
    const doctorName = (profile?.full_name || '').toLowerCase().trim()
    return all.filter(a =>
      (a.doctor || '').toLowerCase().trim() === doctorName ||
      String(a.doctorId) === String(profile?.id) ||
      String(a.doctorProfileId) === String(profile?.id)
    )
  }, [getAllAppointments, profile])

  const today = new Date().toDateString()
  const todayApts = myAppointments.filter(a => new Date(a.date).toDateString() === today)
  const confirmedToday = todayApts.filter(a => a.status === 'confirmed').length
  const pendingToday = todayApts.filter(a => ['pending', 'payment_uploaded'].includes(a.status)).length

  // Unique patients
  const uniquePatients = new Set(myAppointments.map(a => a.patientId)).size

  const stats = [
    { label: "Today's Appointments", value: String(todayApts.length), icon: Calendar, color: 'text-primary-600 bg-primary-50', change: `${confirmedToday} confirmed, ${pendingToday} pending` },
    { label: 'Total Patients',        value: String(uniquePatients),   icon: Users,     color: 'text-secondary-500 bg-secondary-50', change: `${myAppointments.length} total visits` },
    { label: 'This Month Revenue',    value: myAppointments.length > 0 ? `Rs ${(myAppointments.reduce((s, a) => s + Number(a.fee || 0), 0)).toLocaleString()}` : 'Rs 0', icon: TrendingUp, color: 'text-teal-600 bg-teal-50', change: 'All time earnings' },
    { label: 'Completed',             value: String(myAppointments.filter(a => a.status === 'completed').length), icon: Activity, color: 'text-yellow-600 bg-yellow-50', change: 'Consultations done' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Good morning, {profile?.full_name?.split(' ')[0] || 'Doctor'} 👨‍⚕️
            </h1>
            <p className="text-text-muted mt-1">
              {todayApts.length > 0
                ? `You have ${todayApts.length} appointment${todayApts.length !== 1 ? 's' : ''} today.`
                : 'No appointments today. Enjoy your day!'}
            </p>
          </div>
          <Link to="/doctor/prescriptions">
            <Button icon={Pill}>New Prescription</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(stat => (
            <Card key={stat.label} className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                <p className="text-xs font-semibold text-text-secondary mt-0.5 leading-tight">{stat.label}</p>
                <p className="text-xs text-text-muted mt-1">{stat.change}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's schedule */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader
                action={
                  <Link to="/doctor/appointments">
                    <Button variant="ghost" size="sm">View all <ArrowRight className="w-3.5 h-3.5" /></Button>
                  </Link>
                }
              >
                <CardTitle>Today's Appointments</CardTitle>
              </CardHeader>

              <div className="space-y-3">
                {todayApts.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-10 h-10 text-surface-200 mx-auto mb-3" />
                    <p className="text-text-muted text-sm">No appointments today</p>
                    <p className="text-xs text-text-muted mt-1">Patients who book with you will appear here</p>
                  </div>
                ) : (
                  todayApts.map(apt => (
                    <div key={apt.id} className="flex items-center gap-4 p-3 hover:bg-surface-50 rounded-xl transition-colors">
                      <div className="w-16 text-center flex-shrink-0">
                        <p className="text-sm font-bold text-text-primary">{apt.time}</p>
                      </div>
                      <div className="w-px h-10 bg-surface-200 flex-shrink-0" />
                      <Avatar name={apt.patient} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-primary text-sm">{apt.patientName || apt.patient}</p>
                        <p className="text-xs text-text-muted">{apt.reason}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusVariants[apt.status] || 'yellow'} dot>
                          {apt.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Quick stats */}
          <div className="space-y-4">
            <Card>
              <CardTitle className="mb-4">Quick Overview</CardTitle>
              <div className="space-y-3">
                {[
                  { label: 'Pending Reviews', value: 3, color: 'text-yellow-600 bg-yellow-50', icon: AlertCircle },
                  { label: 'Completed Today', value: 0, color: 'text-secondary-600 bg-secondary-50', icon: CheckCircle2 },
                  { label: 'Prescriptions Today', value: 0, color: 'text-teal-600 bg-teal-50', icon: Pill },
                  { label: 'Queue Size', value: 4, color: 'text-primary-600 bg-primary-50', icon: Clock },
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

            {/* Next patient */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-5 text-white">
              <p className="text-primary-200 text-xs font-semibold mb-2">NEXT PATIENT</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm">
                  AH
                </div>
                <div>
                  <p className="font-bold">Ali Hassan</p>
                  <p className="text-primary-200 text-xs">9:00 AM • Follow-up</p>
                </div>
              </div>
              <button className="w-full py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl text-sm transition-all">
                Start Consultation
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Chart */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Monthly Patients</CardTitle>
                <p className="text-sm text-text-muted mt-0.5">Patient count trend</p>
              </div>
            </CardHeader>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="patientsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 25px -5px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="patients" stroke="#2563eb" strokeWidth={2} fill="url(#patientsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Revenue</CardTitle>
                <p className="text-sm text-text-muted mt-0.5">Monthly revenue (PKR)</p>
              </div>
            </CardHeader>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  formatter={(v) => [`Rs ${v.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
