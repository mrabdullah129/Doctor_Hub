import { useState } from 'react'
import {
  FileText, Pill, Activity, Calendar, Lock, ChevronDown,
  ChevronRight, Info, Stethoscope
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import { formatDate } from '../../lib/utils'
import { cn } from '../../lib/utils'

const medicalHistory = [
  {
    id: 1,
    date: new Date(Date.now() - 86400000 * 7).toISOString(),
    doctor: 'Dr. Sarah Ahmed',
    specialty: 'Cardiologist',
    diagnosis: 'Hypertension Stage 1',
    treatment: 'Prescribed ACE inhibitors and lifestyle changes',
    type: 'consultation',
    prescriptions: [
      { name: 'Lisinopril 10mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days' },
      { name: 'Amlodipine 5mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days' },
    ],
    notes: 'Patient advised to monitor blood pressure daily. Follow up in 1 month.',
  },
  {
    id: 2,
    date: new Date(Date.now() - 86400000 * 30).toISOString(),
    doctor: 'Dr. Hassan Khan',
    specialty: 'General Physician',
    diagnosis: 'Acute Bronchitis',
    treatment: 'Antibiotics and supportive care',
    type: 'consultation',
    prescriptions: [
      { name: 'Amoxicillin 500mg', dosage: '1 capsule', frequency: 'Twice daily', duration: '7 days' },
      { name: 'Salbutamol Inhaler', dosage: '2 puffs', frequency: 'As needed', duration: '14 days' },
    ],
    notes: 'Chest X-ray normal. Follow up if symptoms worsen.',
  },
  {
    id: 3,
    date: new Date(Date.now() - 86400000 * 90).toISOString(),
    doctor: 'Dr. Fatima Shah',
    specialty: 'Dermatologist',
    diagnosis: 'Eczema (Atopic Dermatitis)',
    treatment: 'Topical corticosteroids and moisturizer therapy',
    type: 'consultation',
    prescriptions: [
      { name: 'Hydrocortisone Cream 1%', dosage: 'Apply thin layer', frequency: 'Twice daily', duration: '21 days' },
    ],
    notes: 'Avoid known triggers. Use mild soap. Moisturize regularly.',
  },
]

const typeIcons = {
  consultation: Stethoscope,
  surgery: Activity,
  checkup: FileText,
}

const typeColors = {
  consultation: 'text-primary-600 bg-primary-50',
  surgery: 'text-red-600 bg-red-50',
  checkup: 'text-teal-600 bg-teal-50',
}

function HistoryItem({ record }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = typeIcons[record.type] || FileText
  const color = typeColors[record.type] || 'text-gray-600 bg-gray-50'

  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      {/* Timeline line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-surface-200" />

      {/* Timeline dot */}
      <div className="absolute left-0 top-2 w-6 h-6 -translate-x-1/2 bg-white border-2 border-primary-400 rounded-full flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-primary-400" />
      </div>

      <div className="card hover:shadow-medium transition-all ml-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary">{record.diagnosis}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-text-muted">{record.doctor}</span>
                <span className="text-surface-300">•</span>
                <Badge variant="gray">{record.specialty}</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(record.date)}
            </div>
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <Lock className="w-3 h-3" />
              Immutable
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 hover:bg-surface-100 rounded-lg transition-colors text-text-muted"
            >
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-surface-200 space-y-4 animate-fade-in">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Treatment</p>
              <p className="text-sm text-text-secondary">{record.treatment}</p>
            </div>

            {record.prescriptions.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Prescriptions</p>
                <div className="space-y-2">
                  {record.prescriptions.map((rx, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                          <Pill className="w-4 h-4 text-teal-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{rx.name}</p>
                          <p className="text-xs text-text-muted">{rx.dosage} • {rx.frequency}</p>
                        </div>
                      </div>
                      <Badge variant="blue">{rx.duration}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {record.notes && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 flex gap-2">
                <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700">{record.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function MedicalHistory() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Medical History</h1>
            <p className="text-text-muted mt-1">Complete chronological record of your health journey</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-xl">
            <Lock className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-700 font-medium">Read-only records</span>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Records', value: '12', icon: FileText, color: 'text-primary-600 bg-primary-50' },
            { label: 'Consultations', value: '8', icon: Stethoscope, color: 'text-secondary-500 bg-secondary-50' },
            { label: 'Prescriptions', value: '15', icon: Pill, color: 'text-teal-600 bg-teal-50' },
            { label: 'Diagnoses', value: '5', icon: Activity, color: 'text-purple-600 bg-purple-50' },
          ].map((item) => (
            <Card key={item.label} className="flex items-center gap-3 py-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-text-primary">{item.value}</p>
                <p className="text-xs text-text-muted">{item.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Important notice */}
        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-primary-700">
            <span className="font-bold">Privacy Protected: </span>
            Your medical history is immutable and cannot be deleted. Doctors can only append new records. Old prescriptions cannot be edited. This ensures complete audit trail integrity.
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h2 className="text-lg font-bold text-text-primary mb-5">Consultation Timeline</h2>
          <div className="space-y-0">
            {medicalHistory.map((record) => (
              <HistoryItem key={record.id} record={record} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
