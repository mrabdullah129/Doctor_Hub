import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FileText, MessageSquare, Calendar, Pill, RefreshCw } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../store/authStore'
import useAppointmentStore from '../../store/appointmentStore'
import { formatDate } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function MyPatients() {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const { getAllAppointments } = useAppointmentStore()

  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [historyModal, setHistoryModal] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadPatients = async () => {
    setLoading(true)

    // ── 1. Build patient list from appointment store ───────────
    const all = getAllAppointments()
    const doctorName = (profile?.full_name || '').toLowerCase().trim()

    // Filter appointments for this doctor
    const mine = all.filter(a =>
      (a.doctor || '').toLowerCase().trim() === (profile?.full_name || '').toLowerCase().trim() ||
      String(a.doctorId) === String(profile?.id) ||
      String(a.doctorProfileId) === String(profile?.id)
    )

    // Deduplicate by patientId → most recent appointment wins
    const patientMap = new Map()
    mine.forEach(a => {
      const pid = a.patientId
      if (!patientMap.has(pid) || new Date(a.date) > new Date(patientMap.get(pid).date)) {
        patientMap.set(pid, a)
      }
    })

    const fromStore = Array.from(patientMap.values()).map(a => ({
      id: a.patientId,
      name: a.patientName || a.patient || (a.patientEmail ? a.patientEmail.split('@')[0] : 'Patient'),
      phone: a.phone || '',
      age: a.age || 0,
      gender: a.gender || '',
      condition: a.reason || 'General',
      lastVisit: a.date,
      totalVisits: mine.filter(x => x.patientId === a.patientId).length,
      status: 'active',
      history: mine
        .filter(x => x.patientId === a.patientId)
        .map(x => ({
          date: x.date,
          diagnosis: x.reason || 'Consultation',
          notes: `Appointment at ${x.time}. Status: ${x.status}.`,
        })),
    }))

    if (fromStore.length > 0) setPatients(fromStore)

    // ── 2. Supabase for real users ─────────────────────────────
    if (user?.isDemo) { setLoading(false); return }

    try {
      const { data: doctorRow } = await supabase
        .from('doctors').select('id').eq('profile_id', profile.id).single()

      if (!doctorRow) { setLoading(false); return }

      const { data, error } = await supabase
        .from('appointments')
        .select('*, patient:patient_id(id, full_name, phone, email, date_of_birth, gender)')
        .eq('doctor_id', doctorRow.id)
        .order('appointment_date', { ascending: false })

      if (!error && data && data.length > 0) {
        // Deduplicate by patient_id
        const map = new Map()
        data.forEach(a => {
          if (!map.has(a.patient_id)) map.set(a.patient_id, [])
          map.get(a.patient_id).push(a)
        })

        const fromDB = Array.from(map.entries()).map(([pid, apts]) => {
          const latest = apts[0]
          const p = latest.patient || {}
          return {
            id: pid,
            name: p.full_name || 'Patient',
            phone: p.phone || '',
            age: p.date_of_birth
              ? Math.floor((Date.now() - new Date(p.date_of_birth)) / (365.25 * 24 * 3600 * 1000))
              : 0,
            gender: p.gender || '',
            condition: latest.reason || 'General',
            lastVisit: latest.appointment_date,
            totalVisits: apts.length,
            status: 'active',
            history: apts.map(a => ({
              date: a.appointment_date,
              diagnosis: a.reason || 'Consultation',
              notes: `${a.appointment_time} • ${a.status}`,
            })),
          }
        })

        // Merge: DB wins, keep local-only patients not yet in DB
        const dbIds = new Set(fromDB.map(p => p.id))
        const localOnly = fromStore.filter(p => !dbIds.has(p.id))
        setPatients([...fromDB, ...localOnly])
      }
    } catch (err) {
      console.warn('Doctor patients load failed:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPatients() }, [profile?.id])

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.condition || '').toLowerCase().includes(search.toLowerCase())
  )

  const openMessage  = (p) => { navigate('/doctor/messages');      toast.success(`Opening chat with ${p.name}`) }
  const openPrescribe = (p) => { navigate('/doctor/prescriptions'); toast.success(`Creating prescription for ${p.name}`) }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">My Patients</h1>
            <p className="text-text-muted mt-1">
              {patients.length > 0
                ? `${patients.length} patient${patients.length !== 1 ? 's' : ''} under your care`
                : 'No patients yet'}
            </p>
          </div>
          <button onClick={loadPatients}
            className="p-2 hover:bg-surface-100 rounded-xl text-text-muted transition-colors" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Patients',   value: patients.length,                                color: 'text-primary-600' },
            { label: 'Active',           value: patients.filter(p => p.status === 'active').length, color: 'text-secondary-500' },
            { label: 'Total Visits',     value: patients.reduce((s, p) => s + p.totalVisits, 0), color: 'text-teal-600' },
          ].map(s => (
            <Card key={s.label} className="text-center py-4">
              <p className={`text-2xl font-bold mb-1 ${s.color}`}>{s.value}</p>
              <p className="text-xs text-text-muted font-medium">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-surface-200 rounded-xl px-4 py-3 shadow-soft max-w-md">
          <Search className="w-4 h-4 text-text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search patients by name or condition..."
            className="flex-1 bg-transparent text-sm focus:outline-none text-text-primary placeholder-text-muted" />
        </div>

        {/* Table */}
        {loading && patients.length === 0 ? (
          <div className="text-center py-12">
            <RefreshCw className="w-6 h-6 text-primary-600 animate-spin mx-auto mb-3" />
            <p className="text-text-muted text-sm">Loading patients…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-bold text-text-primary">No patients yet</p>
            <p className="text-text-muted text-sm mt-1">
              {patients.length === 0
                ? 'Patients who book appointments with you will appear here'
                : 'No patients match your search'}
            </p>
          </div>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200">
                    {['Patient', 'Condition', 'Last Visit', 'Visits', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {filtered.map(p => (
                    <tr key={p.id} className="hover:bg-surface-50 transition-colors group">
                      <td className="py-3 pr-4">
                        <button className="flex items-center gap-3 text-left" onClick={() => setHistoryModal(p)}>
                          <Avatar name={p.name} size="sm" />
                          <div>
                            <p className="font-semibold text-text-primary text-sm group-hover:text-primary-600 transition-colors">{p.name}</p>
                            {p.phone && <p className="text-xs text-text-muted">{p.phone}</p>}
                          </div>
                        </button>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="blue">{p.condition}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-sm text-text-muted whitespace-nowrap">
                        {p.lastVisit ? formatDate(p.lastVisit) : '—'}
                      </td>
                      <td className="py-3 pr-4 text-sm font-semibold text-text-primary">{p.totalVisits}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={p.status === 'active' ? 'green' : 'gray'} dot>{p.status}</Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <button title="View history" onClick={() => setHistoryModal(p)}
                            className="p-1.5 hover:bg-primary-50 text-text-muted hover:text-primary-600 rounded-lg transition-colors">
                            <FileText className="w-4 h-4" />
                          </button>
                          <button title="Message" onClick={() => openMessage(p)}
                            className="p-1.5 hover:bg-teal-50 text-text-muted hover:text-teal-600 rounded-lg transition-colors">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button title="Prescribe" onClick={() => openPrescribe(p)}
                            className="p-1.5 hover:bg-secondary-50 text-text-muted hover:text-secondary-600 rounded-lg transition-colors">
                            <Pill className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* History Modal */}
      <Modal isOpen={!!historyModal} onClose={() => setHistoryModal(null)}
        title={`Visit History — ${historyModal?.name}`} size="lg">
        {historyModal && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl mb-2">
              <Avatar name={historyModal.name} size="md" />
              <div>
                <p className="font-bold text-text-primary">{historyModal.name}</p>
                <p className="text-xs text-text-muted">{historyModal.phone}</p>
              </div>
              <Badge variant={historyModal.status === 'active' ? 'green' : 'gray'} className="ml-auto">
                {historyModal.totalVisits} visit{historyModal.totalVisits !== 1 ? 's' : ''}
              </Badge>
            </div>

            {historyModal.history.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6">No visit records yet</p>
            ) : (
              historyModal.history.map((h, i) => (
                <div key={i} className="relative pl-6 pb-3 last:pb-0">
                  <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-primary-400 border-2 border-white shadow" />
                  {i < historyModal.history.length - 1 && (
                    <div className="absolute left-1.5 top-4 bottom-0 w-px bg-surface-200" />
                  )}
                  <div className="p-3 bg-surface-50 rounded-xl border border-surface-200">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-text-primary text-sm">{h.diagnosis}</p>
                      <span className="text-xs text-text-muted">{formatDate(h.date)}</span>
                    </div>
                    <p className="text-xs text-text-secondary">{h.notes}</p>
                  </div>
                </div>
              ))
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" className="flex-1" icon={MessageSquare}
                onClick={() => { setHistoryModal(null); openMessage(historyModal) }}>Message</Button>
              <Button className="flex-1" icon={Pill}
                onClick={() => { setHistoryModal(null); openPrescribe(historyModal) }}>Prescribe</Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}
