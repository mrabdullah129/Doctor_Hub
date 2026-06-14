import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'

const monthly = [
  { month: 'Jan', patients: 35, revenue: 70000, appointments: 40 },
  { month: 'Feb', patients: 42, revenue: 84000, appointments: 48 },
  { month: 'Mar', patients: 38, revenue: 76000, appointments: 44 },
  { month: 'Apr', patients: 55, revenue: 110000, appointments: 62 },
  { month: 'May', patients: 48, revenue: 96000, appointments: 55 },
  { month: 'Jun', patients: 62, revenue: 124000, appointments: 70 },
]

const diseases = [
  { name: 'Hypertension', value: 35, color: '#2563eb' },
  { name: 'Heart Disease', value: 28, color: '#10b981' },
  { name: 'Arrhythmia', value: 18, color: '#14b8a6' },
  { name: 'Angina', value: 12, color: '#8b5cf6' },
  { name: 'Others', value: 7, color: '#f59e0b' },
]

const CHART_STYLE = {
  contentStyle: { borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 25px -5px rgba(0,0,0,0.1)' }
}

export default function Analytics() {
  const stats = [
    { label: 'Total Patients', value: '248', sub: '+12 this month', color: 'text-primary-600 bg-primary-50' },
    { label: 'Total Revenue', value: 'Rs 560K', sub: '+18% growth', color: 'text-secondary-500 bg-secondary-50' },
    { label: 'Avg Rating', value: '4.9 ★', sub: '240 reviews', color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Completion Rate', value: '96%', sub: 'Of appointments', color: 'text-teal-600 bg-teal-50' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
          <p className="text-text-muted mt-1">Insights into your practice performance</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => (
            <Card key={s.label} className="text-center py-5">
              <p className={`text-2xl font-bold mb-1 ${s.color.split(' ')[0]}`}>{s.value}</p>
              <p className="text-sm font-semibold text-text-primary">{s.label}</p>
              <p className="text-xs text-text-muted mt-0.5">{s.sub}</p>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly patients */}
          <Card>
            <CardTitle className="mb-1">Monthly Patients</CardTitle>
            <p className="text-sm text-text-muted mb-4">Patient count over the last 6 months</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip {...CHART_STYLE} />
                <Area type="monotone" dataKey="patients" name="Patients" stroke="#2563eb" strokeWidth={2} fill="url(#pGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Revenue */}
          <Card>
            <CardTitle className="mb-1">Monthly Revenue</CardTitle>
            <p className="text-sm text-text-muted mb-4">Revenue in PKR</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}K`} />
                <Tooltip {...CHART_STYLE} formatter={v => [`Rs ${v.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Disease distribution */}
          <Card>
            <CardTitle className="mb-4">Popular Diseases Treated</CardTitle>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={diseases} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {diseases.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={v => [`${v}%`, '']} contentStyle={{ borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {diseases.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-xs text-text-secondary">{d.name}</span>
                    </div>
                    <span className="text-xs font-bold text-text-primary">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Appointment trends */}
          <Card>
            <CardTitle className="mb-1">Appointment Trends</CardTitle>
            <p className="text-sm text-text-muted mb-4">Monthly appointments booked</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip {...CHART_STYLE} />
                <Area type="monotone" dataKey="appointments" name="Appointments" stroke="#14b8a6" strokeWidth={2} fill="url(#aGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
