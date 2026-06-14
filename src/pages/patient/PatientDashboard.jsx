import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar, FileText, Pill, MessageSquare, Search, TrendingUp,
  Clock, CheckCircle2, ArrowRight, Activity
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import useAuthStore from '../../store/authStore'
import useAppointmentStore from '../../store/appointmentStore'
import { formatDate } from '../../lib/utils'

const statusVariants = {
  confirmed:        'green',
  pending:          'yellow',
  payment_uploaded: 'blue',
  payment_verified: 'blue',
  completed:        'gray',
  cancelled:        'red',
}

export default function PatientDashboard() {
  const { profile, user } = useAuthStore()
  const { getAppointments } = useAppointmentStore()

  // Real appointments for this patient
  const myAppointments = useMemo(() =>
    getAppointments(user?.id || ''), [user?.id, getAppointments]
  )

  const upcoming = myAppointments
    .filter(a => ['pending', 'payment_uploaded', 'payment_verified', 'confirmed'].includes(a.status))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3)

  const stats = [
    {
      label: 'Upcoming Appointments',
      value: String(upcoming.length),
      icon: Calendar,
      color: 'text-primary-600 bg-primary-50',
      change: upcoming.length > 0 ? `Next: ${formatDate(upcoming[0]?.date)}` : 'No upcoming',
    },
    {
      label: 'Total Consultations',
      value: String(myAppointments.filter(a => a.status === 'completed').length),
      icon: Activity,
      color: 'text-secondary-500 bg-secondary-50',
      change: `${myAppointments.length} total booked`,
    },
    {
      label: 'Medical Records',
      value: String(myAppointments.filter(a => a.status === 'completed').length),
      icon: FileText,
      color: 'text-purple-600 bg-purple-50',
      change: 'From completed visits',
    },
    {
      label: 'Active Appointments',
      value: String(myAppointments.filter(a => a.status !== 'cancelled' && a.status !== 'completed').length),
      icon: Pill,
      color: 'text-teal-600 bg-teal-50',
      change: `${myAppointments.filter(a => a.status === 'confirmed').length} confirmed`,
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Good morning, {profile?.full_name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="text-text-muted mt-1">Here's what's happening with your health today.</p>
          </div>
          <Link to="/patient/search">
            <Button icon={Search}>Find a Doctor</Button>
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
                <p className="text-xs font-semibold text-text-secondary mt-0.5">{stat.label}</p>
                <p className="text-xs text-text-muted mt-1">{stat.change}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming appointments */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader
                action={
                  <Link to="/patient/appointments">
                    <Button variant="ghost" size="sm">
                      View all <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                }
              >
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>

              {upcoming.length === 0 ? (
                <div className="text-center py-10">
                  <Calendar className="w-10 h-10 text-surface-200 mx-auto mb-3" />
                  <p className="text-text-muted text-sm font-medium">No upcoming appointments</p>
                  <Link to="/patient/search" className="text-primary-600 text-sm font-semibold hover:underline mt-1 block">
                    Book one now
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map(apt => (
                    <div key={apt.id}
                      className="flex items-center gap-4 p-4 bg-surface-50 rounded-xl hover:bg-surface-100 transition-colors">
                      <Avatar name={apt.doctor} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-primary text-sm">{apt.doctor}</p>
                        {apt.specialty && <p className="text-xs text-text-muted">{apt.specialty}</p>}
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-text-muted">
                            <Calendar className="w-3 h-3" />{formatDate(apt.date)}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-text-muted">
                            <Clock className="w-3 h-3" />{apt.time}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={statusVariants[apt.status] || 'gray'} dot>
                          {apt.status.replace(/_/g, ' ')}
                        </Badge>
                        {apt.fee > 0 && (
                          <p className="text-xs text-text-muted mt-1">Rs {Number(apt.fee).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Quick actions + tip */}
          <div className="space-y-4">
            <Card>
              <CardTitle className="mb-4">Quick Actions</CardTitle>
              <div className="space-y-2">
                {[
                  { icon: Search,       label: 'Search Doctors',    href: '/patient/search',            color: 'text-primary-600 bg-primary-50'  },
                  { icon: Calendar,     label: 'My Appointments',   href: '/patient/appointments',      color: 'text-secondary-500 bg-secondary-50' },
                  { icon: FileText,     label: 'Medical History',   href: '/patient/medical-history',   color: 'text-purple-600 bg-purple-50'   },
                  { icon: Pill,         label: 'Prescriptions',     href: '/patient/prescriptions',     color: 'text-teal-600 bg-teal-50'       },
                  { icon: MessageSquare,label: 'Messages',          href: '/patient/messages',          color: 'text-pink-600 bg-pink-50'       },
                ].map(action => (
                  <Link key={action.href} to={action.href}
                    className="flex items-center gap-3 p-3 hover:bg-surface-50 rounded-xl transition-colors group">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${action.color}`}>
                      <action.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary">
                      {action.label}
                    </span>
                    <ArrowRight className="w-4 h-4 text-text-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </Card>

            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-5 text-white">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="font-bold text-sm mb-1">Health Tip</p>
              <p className="text-primary-100 text-xs leading-relaxed">
                Regular check-ups help catch health issues early. Schedule your annual wellness exam today.
              </p>
            </div>
          </div>
        </div>

        {/* All appointments summary */}
        {myAppointments.length > 0 && (
          <Card>
            <CardHeader
              action={
                <Link to="/patient/appointments">
                  <Button variant="ghost" size="sm">View all <ArrowRight className="w-3.5 h-3.5" /></Button>
                </Link>
              }
            >
              <CardTitle>All My Appointments</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {myAppointments.slice(0, 4).map(apt => (
                <div key={apt.id}
                  className="flex items-center gap-4 p-3 bg-surface-50 rounded-xl hover:bg-surface-100 transition-colors">
                  <Avatar name={apt.doctor} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary text-sm">{apt.doctor}</p>
                    <p className="text-xs text-text-muted">{formatDate(apt.date)} • {apt.time}</p>
                  </div>
                  <Badge variant={statusVariants[apt.status] || 'gray'} dot>
                    {apt.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
