import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Eye, Stethoscope, RefreshCw, Trash2 } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import StarRating from '../../components/ui/StarRating'
import toast from 'react-hot-toast'
import useDoctorStore from '../../store/doctorStore'
import { SPECIALIZATIONS, CITIES, TREATMENT_TYPES } from '../../lib/constants'
import { supabase } from '../../lib/supabase'

const emptyForm = {
  name: '', email: '', phone: '', city: '', specialty: '',
  experience: '', qualifications: '', consultation_fee: '', bio: '', treatmentType: 'allopathic',
}

export default function DoctorVerification() {
  const {
    pendingDoctors,
    verifiedDoctors,
    approveDoctor,
    rejectDoctor,
    addVerifiedDoctor,
  } = useDoctorStore()

  const [selected,  setSelected]  = useState(null)
  const [addOpen,   setAddOpen]   = useState(false)
  const [form,      setForm]      = useState(emptyForm)
  const [adding,    setAdding]    = useState(false)
  const [dbDoctors, setDbDoctors] = useState([])
  const [loadingDb, setLoadingDb] = useState(false)

  const upd = (f) => (e) => setForm(prev => ({ ...prev, [f]: e.target.value }))

  const loadDbDoctors = async () => {
    setLoadingDb(true)
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setDbDoctors(data || [])
    } catch (error) {
      console.warn('Failed to load Supabase doctors:', error)
    } finally {
      setLoadingDb(false)
    }
  }

  useEffect(() => {
    loadDbDoctors()
  }, [])

  const handleDbVerify = async (doctor, verified) => {
    try {
      const { error } = await supabase
        .from('doctors')
        .update({ is_verified: verified })
        .eq('id', doctor.id)
      if (error) throw error
      toast.success(`${doctor.display_name || 'Doctor'} ${verified ? 'verified' : 'unverified'}`)
      loadDbDoctors()
    } catch (error) {
      toast.error(error.message || 'Failed to update doctor')
    }
  }

  const handleDbDelete = async (doctor) => {
    const ok = globalThis.confirm(`Delete ${doctor.display_name || 'this doctor'} from doctors table?`)
    if (!ok) return

    try {
      const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', doctor.id)
      if (error) throw error
      toast.success('Doctor deleted')
      loadDbDoctors()
    } catch (error) {
      toast.error(error.message || 'Failed to delete doctor')
    }
  }

  const handleApprove = (id, name) => {
    approveDoctor(id)
    setSelected(null)
    toast.success(`✅ ${name} has been verified and activated!`)
  }

  const handleReject = (id, name) => {
    rejectDoctor(id)
    setSelected(null)
    toast.error(`❌ ${name}'s application has been rejected.`)
  }

  const handleAdd = async () => {
    if (!form.name.trim())     { toast.error('Name is required'); return }
    if (!form.specialty.trim()){ toast.error('Specialty is required'); return }
    setAdding(true)
    await new Promise(r => setTimeout(r, 600))
    addVerifiedDoctor({
      name:           form.name,
      email:          form.email,
      phone:          form.phone,
      city:           form.city,
      specialty:      form.specialty,
      experience:     Number(form.experience) || 0,
      qualifications: form.qualifications,
      fee:            Number(form.consultation_fee) || 0,
      bio:            form.bio,
      treatmentType:  form.treatmentType,
    })
    setAdding(false)
    setAddOpen(false)
    setForm(emptyForm)
    toast.success(`Dr. ${form.name} added and verified!`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Doctor Verification</h1>
            <p className="text-text-muted mt-1">
              {pendingDoctors.length > 0
                ? `${pendingDoctors.length} application${pendingDoctors.length > 1 ? 's' : ''} pending review`
                : 'No pending applications'}
            </p>
          </div>
          <Button icon={Stethoscope} onClick={() => setAddOpen(true)}>
            Add Doctor
          </Button>
        </div>

        {/* ── Pending ───────────────────────────────── */}
        {pendingDoctors.length > 0 ? (
          <div>
            <h2 className="text-base font-bold text-text-primary mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" />
              Pending Verification ({pendingDoctors.length})
            </h2>
            <div className="space-y-3">
              {pendingDoctors.map(doc => (
                <Card key={doc.id} className="hover:shadow-medium transition-all border-l-4 border-l-yellow-400">
                  <div className="flex items-center gap-4 flex-wrap">
                    <Avatar name={doc.name} size="lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-text-primary">{doc.name}</h3>
                      <p className="text-sm text-text-muted">{doc.qualifications || '—'}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge variant="blue">{doc.specialty || 'Unknown'}</Badge>
                        {doc.city && <span className="text-xs text-text-muted">{doc.city}</span>}
                        {doc.experience > 0 && (
                          <span className="text-xs text-text-muted">{doc.experience} yrs exp</span>
                        )}
                        {doc.fee > 0 && (
                          <span className="text-xs font-semibold text-primary-600">Rs {doc.fee.toLocaleString()}</span>
                        )}
                      </div>
                      {doc.email && (
                        <p className="text-xs text-text-muted mt-0.5">{doc.email}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="ghost" size="sm" icon={Eye}
                        onClick={() => setSelected(doc)}>
                        Review
                      </Button>
                      <Button variant="success" size="sm" icon={CheckCircle2}
                        onClick={() => handleApprove(doc.id, doc.name)}>
                        Approve
                      </Button>
                      <Button variant="danger" size="sm" icon={XCircle}
                        onClick={() => handleReject(doc.id, doc.name)}>
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-secondary-50 border border-secondary-100 rounded-2xl">
            <CheckCircle2 className="w-5 h-5 text-secondary-500" />
            <p className="text-sm font-medium text-secondary-700">
              No pending applications — all caught up!
            </p>
          </div>
        )}

        {/* ── Verified ──────────────────────────────── */}
        <div>
          <h2 className="text-base font-bold text-text-primary mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary-500" />
            Verified Doctors ({verifiedDoctors.length})
          </h2>
          {verifiedDoctors.length === 0 ? (
            <p className="text-sm text-text-muted">No verified doctors yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {verifiedDoctors.map(doc => (
                <Card key={doc.id} className="flex items-center gap-3">
                  <Avatar name={doc.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text-primary text-sm truncate">{doc.name}</p>
                    <p className="text-xs text-text-muted truncate">
                      {doc.specialty}{doc.city ? ` • ${doc.city}` : ''}
                    </p>
                    {doc.rating > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={doc.rating} size="xs" showValue />
                        <span className="text-xs text-text-muted">{doc.reviews} reviews</span>
                      </div>
                    )}
                  </div>
                  <Badge variant="green" dot>Verified</Badge>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-500" />
              Supabase Doctors ({dbDoctors.length})
            </h2>
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={loadDbDoctors} loading={loadingDb}>
              Refresh
            </Button>
          </div>

          {dbDoctors.length === 0 ? (
            <p className="text-sm text-text-muted">No Supabase doctors found.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dbDoctors.map(doc => (
                <Card key={doc.id} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={doc.display_name || 'Doctor'} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-text-primary text-sm truncate">{doc.display_name || 'Doctor'}</p>
                      <p className="text-xs text-text-muted truncate">
                        {doc.specialization || 'Specialty missing'}{doc.city ? ` • ${doc.city}` : ''}
                      </p>
                      <p className="text-xs text-text-muted">
                        {Number(doc.experience_years) || 0} yrs exp • Rs {Number(doc.consultation_fee || 0).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={doc.is_verified ? 'green' : 'yellow'} dot>
                      {doc.is_verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={doc.is_verified ? 'secondary' : 'success'}
                      className="flex-1"
                      icon={doc.is_verified ? XCircle : CheckCircle2}
                      onClick={() => handleDbVerify(doc, !doc.is_verified)}
                    >
                      {doc.is_verified ? 'Unverify' : 'Verify'}
                    </Button>
                    <Button size="sm" variant="danger" icon={Trash2} onClick={() => handleDbDelete(doc)}>
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Review Modal ─────────────────────────────── */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)}
        title="Doctor Application Review" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name={selected.name} size="xl" />
              <div>
                <h3 className="text-lg font-bold text-text-primary">{selected.name}</h3>
                <p className="text-sm text-text-muted">{selected.qualifications || '—'}</p>
                <Badge variant="blue" className="mt-1">{selected.specialty}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'City',          value: selected.city       || '—' },
                { label: 'Experience',    value: selected.experience > 0 ? `${selected.experience} years` : '—' },
                { label: 'Phone',         value: selected.phone      || '—' },
                { label: 'Email',         value: selected.email      || '—' },
                { label: 'Fee',           value: selected.fee > 0 ? `Rs ${selected.fee.toLocaleString()}` : '—' },
                { label: 'Treatment',     value: selected.treatmentType || 'allopathic' },
              ].map(r => (
                <div key={r.label} className="p-2.5 bg-surface-50 rounded-xl">
                  <p className="text-xs text-text-muted">{r.label}</p>
                  <p className="font-semibold text-text-primary text-sm mt-0.5 truncate">{r.value}</p>
                </div>
              ))}
            </div>

            {selected.bio && (
              <div className="p-3 bg-surface-50 rounded-xl">
                <p className="text-xs text-text-muted mb-1">Biography</p>
                <p className="text-sm text-text-secondary leading-relaxed">{selected.bio}</p>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button variant="danger" className="flex-1" icon={XCircle}
                onClick={() => handleReject(selected.id, selected.name)}>
                Reject
              </Button>
              <Button variant="success" className="flex-1" icon={CheckCircle2}
                onClick={() => handleApprove(selected.id, selected.name)}>
                Approve Doctor
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Add Doctor Modal ──────────────────────────── */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)}
        title="Add & Verify Doctor" size="lg">
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="Full Name *" value={form.name}  onChange={upd('name')}  placeholder="Dr. Ahmed Khan" />
            <Input label="Email"       value={form.email} onChange={upd('email')} placeholder="doctor@email.com" />
            <Input label="Phone"       value={form.phone} onChange={upd('phone')} placeholder="+92 300 1234567" />
            <Select label="City" options={CITIES} value={form.city} onChange={upd('city')} />
            <Select label="Specialty *" options={SPECIALIZATIONS} value={form.specialty} onChange={upd('specialty')} />
            <Select label="Treatment Type" options={TREATMENT_TYPES} value={form.treatmentType} onChange={upd('treatmentType')} />
            <Input label="Experience (yrs)" type="number" value={form.experience} onChange={upd('experience')} placeholder="10" />
            <Input label="Consultation Fee (PKR)" type="number" value={form.consultation_fee} onChange={upd('consultation_fee')} placeholder="2000" />
          </div>
          <Input label="Qualifications" value={form.qualifications} onChange={upd('qualifications')} placeholder="MBBS, FCPS" />
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1.5">Biography</label>
            <textarea rows={3} value={form.bio} onChange={upd('bio')} placeholder="Brief description..."
              className="w-full px-4 py-3 bg-white border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => { setAddOpen(false); setForm(emptyForm) }}>
              Cancel
            </Button>
            <Button className="flex-1" loading={adding} icon={CheckCircle2} onClick={handleAdd}>
              Add & Verify
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
