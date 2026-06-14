import { Download, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'
import { downloadReportPdf } from '../../lib/reportPdf'

const reports = [
  { title: 'Monthly Revenue Report', desc: 'Total revenue breakdown by doctor and specialty', icon: TrendingUp, color: 'text-primary-600 bg-primary-50', period: 'June 2026' },
  { title: 'User Growth Report', desc: 'New registrations, active users, and churn rate', icon: Users, color: 'text-secondary-500 bg-secondary-50', period: 'June 2026' },
  { title: 'Appointment Summary', desc: 'Completed, cancelled, and pending appointments', icon: Calendar, color: 'text-teal-600 bg-teal-50', period: 'June 2026' },
  { title: 'Payment Analytics', desc: 'Verified vs rejected payments, average fee', icon: DollarSign, color: 'text-purple-600 bg-purple-50', period: 'June 2026' },
]

const quickStats = [
  { label: 'Total Revenue', value: 'Rs 4.2M', sub: 'All time' },
  { label: 'Total Users', value: '22,585', sub: 'Registered' },
  { label: 'Appointments', value: '2,760', sub: 'This month' },
  { label: 'Active Doctors', value: '485', sub: 'Verified' },
]

export default function Reports() {
  const handleDownload = (report) => {
    downloadReportPdf(report, quickStats)
    toast.success(`${report.title} PDF downloaded`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
          <p className="text-text-muted mt-1">Download and view platform reports</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {reports.map(r => (
            <Card key={r.title} className="hover:shadow-medium transition-all">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${r.color}`}>
                  <r.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-text-primary">{r.title}</h3>
                  <p className="text-sm text-text-muted mt-0.5">{r.desc}</p>
                  <p className="text-xs text-primary-600 font-medium mt-2">{r.period}</p>
                </div>
                <Button variant="secondary" size="sm" icon={Download}
                  onClick={() => handleDownload(r)}>
                  Download
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <CardTitle className="mb-4">Quick Stats</CardTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickStats.map(s => (
              <div key={s.label} className="text-center p-4 bg-surface-50 rounded-xl">
                <p className="text-xl font-bold text-text-primary">{s.value}</p>
                <p className="text-sm font-medium text-text-secondary mt-0.5">{s.label}</p>
                <p className="text-xs text-text-muted">{s.sub}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
