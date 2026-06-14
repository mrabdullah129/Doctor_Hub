import { useState } from 'react'
import { Search, ActivitySquare } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { formatDate } from '../../lib/utils'

const logs = [
  { id: 1, user: 'admin@doctorhub.pk', action: 'VERIFY_DOCTOR', resource: 'Dr. Hassan Ali', timestamp: new Date().toISOString(), level: 'info', ip: '192.168.1.1' },
  { id: 2, user: 'super@doctorhub.pk', action: 'ROLE_CHANGE', resource: 'user#2341 patient→admin', timestamp: new Date(Date.now() - 3600000).toISOString(), level: 'warning', ip: '192.168.1.5' },
  { id: 3, user: 'admin@doctorhub.pk', action: 'DEACTIVATE_USER', resource: 'user#1122', timestamp: new Date(Date.now() - 7200000).toISOString(), level: 'danger', ip: '192.168.1.1' },
  { id: 4, user: 'system', action: 'BACKUP_COMPLETE', resource: 'database_v2026_06_13', timestamp: new Date(Date.now() - 14400000).toISOString(), level: 'info', ip: 'internal' },
  { id: 5, user: 'admin@doctorhub.pk', action: 'CONFIG_CHANGE', resource: 'payment_gateway', timestamp: new Date(Date.now() - 21600000).toISOString(), level: 'warning', ip: '192.168.1.1' },
  { id: 6, user: 'super@doctorhub.pk', action: 'FORCE_LOGOUT', resource: 'user#9900', timestamp: new Date(Date.now() - 28800000).toISOString(), level: 'warning', ip: '192.168.1.5' },
  { id: 7, user: 'system', action: 'AUTO_CLEANUP', resource: 'expired_sessions', timestamp: new Date(Date.now() - 43200000).toISOString(), level: 'info', ip: 'internal' },
]

const levelColor = { info: 'blue', warning: 'yellow', danger: 'red', critical: 'red' }

export default function AuditLogs() {
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')

  const filtered = logs.filter(l =>
    (levelFilter === 'all' || l.level === levelFilter) &&
    (!search || l.user.includes(search) || l.action.includes(search.toUpperCase()) || l.resource.includes(search))
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Audit Logs</h1>
          <p className="text-text-muted mt-1">Complete record of all privileged actions on the platform</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-white border border-surface-200 rounded-xl px-4 py-3 shadow-soft flex-1 max-w-sm">
            <Search className="w-4 h-4 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..."
              className="flex-1 bg-transparent text-sm focus:outline-none text-text-primary placeholder-text-muted" />
          </div>
          <div className="flex items-center gap-1 bg-surface-100 rounded-xl p-1">
            {['all', 'info', 'warning', 'danger'].map(f => (
              <button key={f} onClick={() => setLevelFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${levelFilter === f ? 'bg-white text-primary-600 shadow-soft' : 'text-text-muted hover:text-text-primary'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200">
                  {['User', 'Action', 'Resource', 'IP', 'Time', 'Level'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider pb-3 pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map(log => (
                  <tr key={log.id} className="hover:bg-surface-50 transition-colors">
                    <td className="py-3 pr-5 text-sm font-medium text-text-primary">{log.user}</td>
                    <td className="py-3 pr-5">
                      <code className="text-xs bg-surface-100 px-2 py-1 rounded-lg font-mono text-text-secondary">{log.action}</code>
                    </td>
                    <td className="py-3 pr-5 text-sm text-text-muted max-w-[180px] truncate">{log.resource}</td>
                    <td className="py-3 pr-5 text-xs text-text-muted font-mono">{log.ip}</td>
                    <td className="py-3 pr-5 text-xs text-text-muted whitespace-nowrap">{formatDate(log.timestamp, 'HH:mm • MMM dd')}</td>
                    <td className="py-3"><Badge variant={levelColor[log.level] || 'gray'}>{log.level}</Badge></td>
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
