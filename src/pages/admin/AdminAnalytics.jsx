import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'

const monthly = [
  { month: 'Jan', users: 1200, revenue: 240000, appointments: 350 },
  { month: 'Feb', users: 1450, revenue: 290000, appointments: 420 },
  { month: 'Mar', users: 1300, revenue: 260000, appointments: 380 },
  { month: 'Apr', users: 1800, revenue: 360000, appointments: 520 },
  { month: 'May', users: 1650, revenue: 330000, appointments: 480 },
  { month: 'Jun', users: 2100, revenue: 420000, appointments: 610 },
]

const roles = [
  { name: 'Patients', value: 22000, color: '#2563eb' },
  { name: 'Doctors', value: 450, color: '#10b981' },
  { name: 'Assistants', value: 120, color: '#14b8a6' },
  { name: 'Admins', value: 15, color: '#8b5cf6' },
]

const STYLE = { contentStyle: { borderRadius: '12px', border: '1px solid #e2e8f0' } }

export default function AdminAnalytics() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
          <p className="text-text-muted mt-1">Platform-wide analytics and growth metrics</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardTitle className="mb-4">User Growth</CardTitle>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="uGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip {...STYLE} />
                <Area type="monotone" dataKey="users" name="New Users" stroke="#2563eb" strokeWidth={2} fill="url(#uGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <CardTitle className="mb-4">Revenue</CardTitle>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}K`} />
                <Tooltip {...STYLE} formatter={v => [`Rs ${v.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <CardTitle className="mb-4">User Distribution</CardTitle>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={roles} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {roles.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={v => [v.toLocaleString(), '']} contentStyle={{ borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {roles.map(r => (
                  <div key={r.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                      <span className="text-xs text-text-secondary">{r.name}</span>
                    </div>
                    <span className="text-xs font-bold text-text-primary">{r.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-4">Appointments Trend</CardTitle>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="aptGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip {...STYLE} />
                <Area type="monotone" dataKey="appointments" name="Appointments" stroke="#14b8a6" strokeWidth={2} fill="url(#aptGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
