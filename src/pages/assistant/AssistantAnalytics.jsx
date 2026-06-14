import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'

const weekly = [
  { day: 'Mon', verified: 8, rejected: 1, pending: 3 },
  { day: 'Tue', verified: 12, rejected: 2, pending: 5 },
  { day: 'Wed', verified: 6, rejected: 0, pending: 2 },
  { day: 'Thu', verified: 15, rejected: 3, pending: 4 },
  { day: 'Fri', verified: 10, rejected: 1, pending: 6 },
  { day: 'Sat', verified: 14, rejected: 2, pending: 3 },
  { day: 'Sun', verified: 5, rejected: 0, pending: 1 },
]

export default function AssistantAnalytics() {
  const totals = weekly.reduce((acc, d) => ({
    verified: acc.verified + d.verified,
    rejected: acc.rejected + d.rejected,
    pending: acc.pending + d.pending,
  }), { verified: 0, rejected: 0, pending: 0 })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
          <p className="text-text-muted mt-1">Your weekly activity summary</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Verified This Week', value: totals.verified, color: 'text-secondary-500 bg-secondary-50' },
            { label: 'Rejected This Week', value: totals.rejected, color: 'text-red-500 bg-red-50' },
            { label: 'Still Pending', value: totals.pending, color: 'text-yellow-600 bg-yellow-50' },
          ].map(s => (
            <Card key={s.label} className="text-center py-5">
              <p className={`text-3xl font-bold mb-1 ${s.color.split(' ')[0]}`}>{s.value}</p>
              <p className="text-xs text-text-muted font-medium">{s.label}</p>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardTitle className="mb-4">Daily Verification Activity</CardTitle>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weekly}>
                <defs>
                  <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Area type="monotone" dataKey="verified" name="Verified" stroke="#10b981" strokeWidth={2} fill="url(#vGrad)" />
                <Area type="monotone" dataKey="rejected" name="Rejected" stroke="#ef4444" strokeWidth={2} fill="none" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <CardTitle className="mb-4">Payment Status Breakdown</CardTitle>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="verified" name="Verified" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="rejected" name="Rejected" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
