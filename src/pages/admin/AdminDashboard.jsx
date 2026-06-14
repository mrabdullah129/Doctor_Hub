import { useState } from 'react'
import {
  Users, Stethoscope, Calendar, TrendingUp, ShieldCheck,
  AlertTriangle, CheckCircle2, XCircle, ArrowRight, Activity
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import { formatDate } from '../../lib/utils'

const monthlyData = [
  { month: 'Jan', users: 1200, revenue: 240000, appointments: 350 },
  { month: 'Feb', users: 1450, revenue: 290000, appointments: 420 },
  { month: 'Mar', users: 1300, revenue: 260000, appointments: 380 },
  { month: 'Apr', users: 1800, revenue: 360000, appointments: 520 },
  { month: 'May', users: 1650, revenue: 330000, appointments: 480 },
  { month: 'Jun', users: 2100, revenue: 420000, appointments: 610 },
]

const roleDistribution = [
  { name: 'Patients', value: 22000, color: '#2563eb' },
  { name: 'Doctors', value: 450, color: '#10b981' },
  { name: 'Assistants', value: 120, color: '#14b8a6' },
  { name: 'Admins', value: 15, color: '#8b5cf6' },
]

const recentUsers = [
  { id: 1, name: 'Dr. Amna Sheikh', role: 'doctor', status: 'pending', date: new Date().toISOString() },
  { id: 2, name: 'Bilal Khan', role: 'patient', status: 'active', date: new Date().toISOString() },
  { id: 3, name: 'Dr. Raza Mir', role: 'doctor', status: 'pending', date: new Date().toISOString() },
  { id: 4, name: 'Sara Qadir', role: 'patient', status: 'active', date: new Date().toISOString() },
]

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Users', value: '22,585', icon: Users, color: 'text-primary-600 bg-primary-50', change: '+245 this month' },
    { label: 'Active Doctors', value: '485', icon: Stethoscope, color: 'text-secondary-500 bg-secondary-50', change: '+12 this month' },
    { label: 'Total Appointments', value: '2,760', icon: Calendar, color: 'text-purple-600 bg-purple-50', change: '+18% growth' },
    { label: 'Monthly Revenue', value: 'Rs 420K', icon: TrendingUp, color: 'text-teal-600 bg-teal-50', change: '+27% vs last month' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
          <p className="text-text-muted mt-1">Platform overview and management</p>
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
                <p className="text-xs text-text-muted mt-1">{stat.change}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Alerts */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: AlertTriangle, label: 'Pending Doctor Verifications', value: 2, variant: 'yellow', action: 'Review' },
            { icon: ShieldCheck, label: 'Security Alerts', value: 0, variant: 'green', action: 'View' },
            { icon: Activity, label: 'System Health', value: '99.9%', variant: 'green', action: 'Monitor' },
          ].map((alert) => (
            <div key={alert.label} className={`p-4 rounded-2xl border flex items-center gap-4 ${
              alert.variant === 'yellow' ? 'bg-yellow-50 border-yellow-200' : 'bg-secondary-50 border-secondary-200'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                alert.variant === 'yellow' ? 'bg-yellow-100' : 'bg-secondary-100'
              }`}>
                <alert.icon className={`w-5 h-5 ${alert.variant === 'yellow' ? 'text-yellow-600' : 'text-secondary-600'}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary">{alert.label}</p>
                <p className={`text-lg font-bold ${alert.variant === 'yellow' ? 'text-yellow-700' : 'text-secondary-600'}`}>
                  {alert.value}
                </p>
              </div>
              <button className="text-xs font-semibold text-primary-600 hover:underline">{alert.action}</button>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Charts */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Platform Growth</CardTitle>
              </CardHeader>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="aptGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  <Area type="monotone" dataKey="users" name="New Users" stroke="#2563eb" strokeWidth={2} fill="url(#usersGrad)" />
                  <Area type="monotone" dataKey="appointments" name="Appointments" stroke="#10b981" strokeWidth={2} fill="url(#aptGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* User distribution */}
          <Card>
            <CardTitle className="mb-4">User Distribution</CardTitle>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={roleDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {roleDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [v.toLocaleString(), '']} contentStyle={{ borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {roleDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-text-secondary">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-text-primary">{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Users */}
        <Card>
          <CardHeader
            action={
              <Button variant="ghost" size="sm">
                View all users <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            }
          >
            <CardTitle>Recent Registrations</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider pb-3 pr-4">User</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider pb-3 pr-4">Role</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider pb-3 pr-4">Status</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider pb-3">Date</th>
                  <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} size="sm" />
                        <span className="font-medium text-text-primary text-sm">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={user.role === 'doctor' ? 'blue' : 'gray'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={user.status === 'active' ? 'green' : 'yellow'} dot>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm text-text-muted pr-4">{formatDate(user.date)}</td>
                    <td className="py-3">
                      {user.status === 'pending' ? (
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 hover:bg-secondary-50 text-secondary-600 rounded-lg transition-colors">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button className="text-xs text-primary-600 hover:underline font-medium">View</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
