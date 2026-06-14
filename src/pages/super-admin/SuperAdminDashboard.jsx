import {
  Users, Shield, ActivitySquare, Lock, TrendingUp, Globe,
  AlertTriangle, CheckCircle2, Server, Database
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { formatDate } from '../../lib/utils'

const systemData = [
  { time: '00:00', requests: 120, errors: 2 },
  { time: '04:00', requests: 80, errors: 0 },
  { time: '08:00', requests: 350, errors: 5 },
  { time: '12:00', requests: 620, errors: 8 },
  { time: '16:00', requests: 480, errors: 3 },
  { time: '20:00', requests: 290, errors: 1 },
  { time: 'Now', requests: 210, errors: 0 },
]

const auditLogs = [
  { id: 1, user: 'admin@doctorhub.pk', action: 'VERIFY_DOCTOR', resource: 'Dr. Hassan Ali', timestamp: new Date().toISOString(), level: 'info' },
  { id: 2, user: 'super@doctorhub.pk', action: 'ROLE_CHANGE', resource: 'user#2341', timestamp: new Date(Date.now() - 3600000).toISOString(), level: 'warning' },
  { id: 3, user: 'admin@doctorhub.pk', action: 'DELETE_USER', resource: 'user#1122', timestamp: new Date(Date.now() - 7200000).toISOString(), level: 'danger' },
  { id: 4, user: 'system', action: 'BACKUP_COMPLETE', resource: 'database', timestamp: new Date(Date.now() - 14400000).toISOString(), level: 'info' },
  { id: 5, user: 'admin@doctorhub.pk', action: 'CONFIG_CHANGE', resource: 'payment_settings', timestamp: new Date(Date.now() - 21600000).toISOString(), level: 'warning' },
]

const levelColors = {
  info: 'blue',
  warning: 'yellow',
  danger: 'red',
}

export default function SuperAdminDashboard() {
  const stats = [
    { label: 'Total Platform Users', value: '22,585', icon: Users, color: 'text-primary-600 bg-primary-50', sub: '+245 this month' },
    { label: 'Global Revenue', value: 'Rs 4.2M', icon: TrendingUp, color: 'text-secondary-500 bg-secondary-50', sub: '+27% YoY' },
    { label: 'Active Regions', value: '8', icon: Globe, color: 'text-teal-600 bg-teal-50', sub: 'Cities nationwide' },
    { label: 'Security Score', value: '97/100', icon: Shield, color: 'text-purple-600 bg-purple-50', sub: 'Excellent' },
  ]

  const systemHealth = [
    { label: 'API Server', status: 'operational', uptime: '99.9%', icon: Server },
    { label: 'Database', status: 'operational', uptime: '100%', icon: Database },
    { label: 'Auth Service', status: 'operational', uptime: '99.8%', icon: Lock },
    { label: 'Storage', status: 'operational', uptime: '100%', icon: Shield },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Super Admin Control Panel</h1>
            <p className="text-text-muted mt-1">Global system management and monitoring</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-secondary-500 animate-pulse" />
            <span className="text-sm font-semibold text-secondary-700">All Systems Operational</span>
          </div>
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
                <p className="text-xs text-text-muted mt-1">{stat.sub}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* System traffic */}
          <Card>
            <CardHeader>
              <CardTitle>API Traffic (Last 24h)</CardTitle>
            </CardHeader>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={systemData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="requests" name="Requests" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="errors" name="Errors" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* System health */}
          <Card>
            <CardTitle className="mb-5">System Health</CardTitle>
            <div className="space-y-3">
              {systemHealth.map((system) => (
                <div key={system.label} className="flex items-center justify-between p-4 bg-surface-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary-50 flex items-center justify-center">
                      <system.icon className="w-5 h-5 text-secondary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary text-sm">{system.label}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary-500" />
                        <span className="text-xs text-secondary-600">Operational</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-text-primary">{system.uptime}</span>
                    <p className="text-xs text-text-muted">uptime</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Audit Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Logs</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200">
                  {['User', 'Action', 'Resource', 'Time', 'Level'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider pb-3 pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-50 transition-colors">
                    <td className="py-3 pr-6 text-sm font-medium text-text-primary">{log.user}</td>
                    <td className="py-3 pr-6">
                      <code className="text-xs bg-surface-100 px-2 py-1 rounded-lg font-mono text-text-secondary">
                        {log.action}
                      </code>
                    </td>
                    <td className="py-3 pr-6 text-sm text-text-muted">{log.resource}</td>
                    <td className="py-3 pr-6 text-sm text-text-muted">{formatDate(log.timestamp, 'HH:mm MMM dd')}</td>
                    <td className="py-3">
                      <Badge variant={levelColors[log.level] || 'gray'}>{log.level}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Role Management Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardTitle className="mb-5">Role Permissions Overview</CardTitle>
            <div className="space-y-3">
              {[
                { role: 'Patient', perms: ['View doctors', 'Book appointments', 'View prescriptions', 'View history'], color: 'bg-primary-50 text-primary-700' },
                { role: 'Doctor', perms: ['Manage patients', 'Create prescriptions', 'Manage schedule', 'View analytics'], color: 'bg-secondary-50 text-secondary-700' },
                { role: 'Assistant', perms: ['Verify payments', 'Confirm appointments', 'View bookings'], color: 'bg-teal-50 text-teal-700' },
                { role: 'Admin', perms: ['User management', 'Doctor verification', 'Reports', 'Analytics'], color: 'bg-purple-50 text-purple-700' },
              ].map((r) => (
                <div key={r.role} className="p-4 bg-surface-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${r.color}`}>{r.role}</span>
                    <span className="text-xs text-text-muted">{r.perms.length} permissions</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {r.perms.map((p) => (
                      <span key={p} className="text-xs bg-white border border-surface-200 text-text-muted px-2 py-0.5 rounded-lg">{p}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-5">Security Monitoring</CardTitle>
            <div className="space-y-4">
              {[
                { label: 'Failed Login Attempts (24h)', value: 12, threshold: 50, color: 'bg-secondary-500' },
                { label: 'Rate Limit Hits (24h)', value: 8, threshold: 100, color: 'bg-primary-500' },
                { label: 'Suspicious Activity', value: 0, threshold: 10, color: 'bg-teal-500' },
                { label: 'Active Sessions', value: 1247, threshold: 5000, color: 'bg-purple-500' },
              ].map((item) => {
                const pct = Math.min((item.value / item.threshold) * 100, 100)
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-text-secondary font-medium">{item.label}</span>
                      <span className="text-sm font-bold text-text-primary">{item.value.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-surface-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
