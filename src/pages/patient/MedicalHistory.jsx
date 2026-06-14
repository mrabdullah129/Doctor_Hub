import { useEffect, useState } from 'react'
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
import useAuthStore from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import { getPatientPrescriptions } from '../../lib/dataService'

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
  const profile = useAuthStore((s) => s.profile)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadHistory = async () => {
      if (!profile?.id) return

      setLoading(true)
      try {
        const [historyResult, prescriptions] = await Promise.all([
          supabase
            .from('medical_history')
            .select(`
              *,
              doctor:doctor_id ( id, display_name, specialization )
            `)
            .eq('patient_id', profile.id)
            .order('date', { ascending: false }),
          getPatientPrescriptions(profile.id),
        ])

        if (historyResult.error) throw historyResult.error

        const historyRows = historyResult.data || []
        const historyIds = new Set(historyRows.map((row) => row.id))
        const prescriptionByHistory = new Map()

        prescriptions.forEach((prescription) => {
          if (!prescription.medical_history_id) return
          prescriptionByHistory.set(prescription.medical_history_id, prescription)
        })

        const fromHistory = historyRows.map((row) => {
          const linkedPrescription = prescriptionByHistory.get(row.id)
          return {
            id: `history-${row.id}`,
            sourceId: row.id,
            date: row.date || row.created_at,
            doctor: row.doctor?.display_name || 'Doctor',
            specialty: row.doctor?.specialization || '',
            diagnosis: row.diagnosis || '-',
            treatment: row.treatment || linkedPrescription?.advice || '-',
            type: row.type || 'consultation',
            prescriptions: linkedPrescription?.medicines || [],
            notes: row.notes || linkedPrescription?.followUp || '',
          }
        })

        const fromPrescriptions = prescriptions
          .filter((prescription) => !prescription.medical_history_id || !historyIds.has(prescription.medical_history_id))
          .map((prescription) => ({
            id: `prescription-${prescription.id}`,
            sourceId: prescription.id,
            date: prescription.date,
            doctor: prescription.doctor || 'Doctor',
            specialty: prescription.specialty || '',
            diagnosis: prescription.diagnosis || '-',
            treatment: prescription.advice || 'Prescription issued',
            type: 'consultation',
            prescriptions: prescription.medicines || [],
            notes: prescription.followUp || '',
          }))

        const merged = [...fromHistory, ...fromPrescriptions]
          .sort((a, b) => new Date(b.date) - new Date(a.date))

        if (mounted) setRecords(merged)
      } catch (error) {
        console.warn('Failed to load medical history:', error)
        if (mounted) setRecords([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadHistory()
    return () => { mounted = false }
  }, [profile?.id])

  const prescriptionCount = records.reduce((sum, record) => sum + record.prescriptions.length, 0)
  const diagnosisCount = new Set(records.map((record) => record.diagnosis).filter(Boolean)).size

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
            { label: 'Total Records', value: records.length, icon: FileText, color: 'text-primary-600 bg-primary-50' },
            { label: 'Consultations', value: records.filter((record) => record.type === 'consultation').length, icon: Stethoscope, color: 'text-secondary-500 bg-secondary-50' },
            { label: 'Prescriptions', value: prescriptionCount, icon: Pill, color: 'text-teal-600 bg-teal-50' },
            { label: 'Diagnoses', value: diagnosisCount, icon: Activity, color: 'text-purple-600 bg-purple-50' },
          ].map((item) => (
            <Card key={item.label} className="flex items-center gap-3 py-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-text-primary">{String(item.value)}</p>
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
          {loading ? (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-surface-200 mx-auto mb-3 animate-pulse" />
              <p className="font-bold text-text-primary">Loading medical history...</p>
            </div>
          ) : records.length > 0 ? (
            <div className="space-y-0">
              {records.map((record) => (
                <HistoryItem key={record.id} record={record} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-surface-200 mx-auto mb-3" />
              <p className="font-bold text-text-primary">No medical history yet</p>
              <p className="text-text-muted text-sm mt-1">Records will appear here after a doctor creates them.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
