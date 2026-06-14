import { useState } from 'react'
import { Calendar, Search } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import { formatDate } from '../../lib/utils'

const appointments = [
  { id: 1, patient: 'Ali Hassan', doctor: 'Dr. Sarah Ahmed', date: new Date(Date.now() + 86400000).toISOString(), time: '3:00 PM', status: 'confirmed', fee: 2000 },
  { id: 2, patient: 'Fatima Malik', doctor: 'Dr. Sarah Ahmed', date: new Date(Date.now() + 172800000).toISOString(), time: '11:00 AM', status: 'pending', fee: 2000 },
  { id: 3, patient: 'Omar Farooq', doctor: 'Dr. Hassan Khan', date: new Date(Date.now() - 86400000).toISOString(), time: '10:00 AM', status: 'completed', fee: 3500 },
  { id: 4, patient: 'Sara Ahmed', doctor: 'Dr. Fatima Shah', date: new Date(Date.now() - 86400000 * 2).toISOString(), time: '2:30 PM', status: 'cancelled', fee: 2500 },
]

const statusVariant = { pending: 'yellow', payment_verified: 'blue', confirmed: 'green', completed: 'gray', cancelled: 'red' }

export default function AdminAppointments() {
  const [search, setSearch] = useState('')
  const filtered = appointments.filter(a =>
    !search || a.patient.toLowerCase().includes(search.toLowerCase()) || a.doctor.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">All Appointments</h1>
          <p className="text-text-muted mt-1">Platform-wide appointment overview</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-surface-200 rounded-xl px-4 py-3 shadow-soft max-w-sm">
          <Search className="w-4 h-4 text-text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search appointments..."
            className="flex-1 bg-transparent text-sm focus:outline-none text-text-primary placeholder-text-muted" />
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200">
                  {['Patient', 'Doctor', 'Date & Time', 'Fee', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider pb-3 pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-surface-50 transition-colors">
                    <td className="py-4 pr-6">
                      <div className="flex items-center gap-3">
                        <Avatar name={a.patient} size="sm" />
                        <span className="font-semibold text-text-primary text-sm">{a.patient}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-6 text-sm text-text-secondary">{a.doctor}</td>
                    <td className="py-4 pr-6 text-sm text-text-muted">{formatDate(a.date)} • {a.time}</td>
                    <td className="py-4 pr-6 text-sm font-bold text-primary-600">Rs {a.fee.toLocaleString()}</td>
                    <td className="py-4"><Badge variant={statusVariant[a.status] || 'gray'} dot>{a.status}</Badge></td>
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
