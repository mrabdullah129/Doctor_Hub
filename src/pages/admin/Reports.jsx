import { Download, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'
import { downloadReportPdf } from '../../lib/reportPdf'

const reports = [
  {
    title: 'Monthly Revenue Report',
    desc: 'Total revenue breakdown by doctor and specialty',
    icon: TrendingUp,
    color: 'text-primary-600 bg-primary-50',
    period: 'June 2026',
    metrics: [
      { label: 'Monthly Revenue', value: 'Rs 620,000', note: '+14% vs May 2026' },
      { label: 'Consultation Fees', value: 'Rs 480,000', note: '77% of monthly revenue' },
      { label: 'Platform Fees', value: 'Rs 140,000', note: '23% of monthly revenue' },
    ],
    sections: [
      {
        title: 'Revenue By Specialty',
        rows: [
          ['Cardiology', 'Rs 185,000', '30%'],
          ['Dermatology', 'Rs 132,000', '21%'],
          ['Neurology', 'Rs 118,000', '19%'],
          ['General Medicine', 'Rs 105,000', '17%'],
          ['Other Specialties', 'Rs 80,000', '13%'],
        ],
      },
      {
        title: 'Top Doctor Revenue',
        rows: [
          ['Dr. Ahmed Khan', 'Rs 96,000', '48 appointments'],
          ['Dr. Sara Malik', 'Rs 82,000', '41 appointments'],
          ['Dr. Hassan Ali', 'Rs 74,000', '37 appointments'],
        ],
      },
    ],
  },
  {
    title: 'User Growth Report',
    desc: 'New registrations, active users, and churn rate',
    icon: Users,
    color: 'text-secondary-500 bg-secondary-50',
    period: 'June 2026',
    metrics: [
      { label: 'New Users', value: '1,245', note: '+18% vs May 2026' },
      { label: 'Active Users', value: '8,930', note: '39.5% of registered users' },
      { label: 'Churn Rate', value: '3.2%', note: '-0.8% vs May 2026' },
    ],
    sections: [
      {
        title: 'Registrations By Role',
        rows: [
          ['Patients', '1,030', '83%'],
          ['Doctors', '155', '12%'],
          ['Assistants', '60', '5%'],
        ],
      },
      {
        title: 'User Activity',
        rows: [
          ['Daily active users', '2,860', 'Most active segment: patients'],
          ['Weekly active users', '6,420', '72% returning users'],
          ['Inactive users', '710', 'Follow-up recommended'],
        ],
      },
    ],
  },
  {
    title: 'Appointment Summary',
    desc: 'Completed, cancelled, and pending appointments',
    icon: Calendar,
    color: 'text-teal-600 bg-teal-50',
    period: 'June 2026',
    metrics: [
      { label: 'Total Appointments', value: '2,760', note: 'June 2026 bookings' },
      { label: 'Completion Rate', value: '82%', note: '2,263 completed visits' },
      { label: 'Cancellation Rate', value: '6%', note: '166 cancelled bookings' },
    ],
    sections: [
      {
        title: 'Appointment Status',
        rows: [
          ['Completed', '2,263', '82%'],
          ['Pending', '331', '12%'],
          ['Cancelled', '166', '6%'],
        ],
      },
      {
        title: 'Busiest Specialties',
        rows: [
          ['General Medicine', '690 appointments', '25%'],
          ['Cardiology', '552 appointments', '20%'],
          ['Dermatology', '414 appointments', '15%'],
        ],
      },
    ],
  },
  {
    title: 'Payment Analytics',
    desc: 'Verified vs rejected payments, average fee',
    icon: DollarSign,
    color: 'text-purple-600 bg-purple-50',
    period: 'June 2026',
    metrics: [
      { label: 'Verified Payments', value: '2,410', note: 'Rs 580,000 processed' },
      { label: 'Rejected Payments', value: '92', note: '3.7% rejection rate' },
      { label: 'Average Fee', value: 'Rs 241', note: 'Across verified payments' },
    ],
    sections: [
      {
        title: 'Payment Status',
        rows: [
          ['Verified', '2,410', '96.3%'],
          ['Rejected', '92', '3.7%'],
          ['Pending Review', '58', 'Assistant verification needed'],
        ],
      },
      {
        title: 'Payment Methods',
        rows: [
          ['Bank Transfer', 'Rs 245,000', '42%'],
          ['Easypaisa/JazzCash', 'Rs 198,000', '34%'],
          ['Cash at Clinic', 'Rs 137,000', '24%'],
        ],
      },
    ],
  },
]

const quickStats = [
  { label: 'Total Revenue', value: 'Rs 4.2M', sub: 'All time' },
  { label: 'Total Users', value: '22,585', sub: 'Registered' },
  { label: 'Appointments', value: '2,760', sub: 'This month' },
  { label: 'Active Doctors', value: '485', sub: 'Verified' },
]

export default function Reports() {
  const handleDownload = (report) => {
    downloadReportPdf(report)
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
