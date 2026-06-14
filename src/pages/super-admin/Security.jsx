import { Lock, Shield, AlertTriangle, CheckCircle2, Server } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function Security() {
  const metrics = [
    { label: 'Failed Logins (24h)', value: 12, max: 100, color: 'bg-primary-500', safe: true },
    { label: 'Rate Limit Hits (24h)', value: 8, max: 200, color: 'bg-secondary-500', safe: true },
    { label: 'Suspicious Requests', value: 0, max: 20, color: 'bg-teal-500', safe: true },
    { label: 'Active Sessions', value: 1247, max: 5000, color: 'bg-purple-500', safe: true },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Security Monitoring</h1>
            <p className="text-text-muted mt-1">Real-time security metrics and threat detection</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-secondary-500 animate-pulse" />
            <span className="text-sm font-semibold text-secondary-700">All Systems Secure</span>
          </div>
        </div>

        {/* Security score */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
              <span className="text-2xl font-bold">97</span>
            </div>
            <div>
              <p className="text-primary-200 text-sm font-medium">Security Score</p>
              <p className="text-2xl font-bold mt-0.5">Excellent</p>
              <p className="text-primary-200 text-sm mt-1">No critical vulnerabilities detected</p>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <Card>
          <CardTitle className="mb-5">Security Metrics</CardTitle>
          <div className="space-y-4">
            {metrics.map(m => {
              const pct = Math.min((m.value / m.max) * 100, 100)
              return (
                <div key={m.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-secondary font-medium">{m.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-text-primary">{m.value.toLocaleString()}</span>
                      {m.safe
                        ? <CheckCircle2 className="w-4 h-4 text-secondary-500" />
                        : <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                    </div>
                  </div>
                  <div className="w-full bg-surface-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${m.color} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-text-muted mt-1">Threshold: {m.max.toLocaleString()}</p>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Security actions */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Lock, title: 'Force All Logouts', desc: 'Sign out all active sessions platform-wide', variant: 'danger', label: 'Force Logout' },
            { icon: Shield, title: 'Enable Maintenance', desc: 'Put platform in maintenance mode', variant: 'secondary', label: 'Maintenance Mode' },
            { icon: Server, title: 'Backup Database', desc: 'Create an immediate database backup', variant: 'primary', label: 'Backup Now' },
          ].map(action => (
            <Card key={action.title}>
              <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center mb-3">
                <action.icon className="w-5 h-5 text-text-muted" />
              </div>
              <h3 className="font-bold text-text-primary text-sm">{action.title}</h3>
              <p className="text-xs text-text-muted mt-1 mb-4">{action.desc}</p>
              <Button variant={action.variant} size="sm" className="w-full"
                onClick={() => toast.success(`${action.title} executed!`)}>
                {action.label}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
