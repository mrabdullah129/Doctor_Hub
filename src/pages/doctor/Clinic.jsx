import { useState } from 'react'
import { Building2, MapPin, Phone, Clock, Save, Edit2 } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import toast from 'react-hot-toast'
import { CITIES } from '../../lib/constants'

export default function Clinic() {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [clinic, setClinic] = useState({
    name: 'Ahmed Cardiac Care Center',
    address: 'Block 5, Clifton',
    city: 'Karachi',
    phone: '+92 21 35312345',
    openingTime: '09:00',
    closingTime: '17:00',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    about: 'A state-of-the-art cardiac care facility equipped with modern diagnostic tools and experienced medical staff.',
  })

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const toggleDay = (day) => {
    setClinic(c => ({
      ...c,
      workingDays: c.workingDays.includes(day)
        ? c.workingDays.filter(d => d !== day)
        : [...c.workingDays, day],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    setSaving(false)
    setEditing(false)
    toast.success('Clinic information updated!')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Clinic Management</h1>
            <p className="text-text-muted mt-1">Manage your clinic information and settings</p>
          </div>
          <Button variant={editing ? 'secondary' : 'primary'} onClick={() => setEditing(!editing)} icon={Edit2}>
            {editing ? 'Cancel' : 'Edit Clinic'}
          </Button>
        </div>

        {/* Clinic overview banner */}
        {!editing && (
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{clinic.name}</h2>
                <div className="flex items-center gap-2 mt-1 text-primary-100">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{clinic.address}, {clinic.city}</span>
                </div>
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-sm text-primary-100">
                    <Phone className="w-3.5 h-3.5" />{clinic.phone}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-primary-100">
                    <Clock className="w-3.5 h-3.5" />{clinic.openingTime} – {clinic.closingTime}
                  </div>
                </div>
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {days.map(d => (
                    <span key={d} className={`text-xs px-2 py-0.5 rounded-full font-medium ${clinic.workingDays.includes(d) ? 'bg-white/20 text-white' : 'bg-white/5 text-primary-300'}`}>{d}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit form */}
        {editing ? (
          <Card>
            <CardTitle className="mb-5">Edit Clinic Information</CardTitle>
            <div className="space-y-4">
              <Input label="Clinic Name *" value={clinic.name} onChange={e => setClinic(c => ({ ...c, name: e.target.value }))} />
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="Address" value={clinic.address} onChange={e => setClinic(c => ({ ...c, address: e.target.value }))} />
                <Select label="City" options={CITIES} value={clinic.city} onChange={e => setClinic(c => ({ ...c, city: e.target.value }))} />
              </div>
              <Input label="Phone Number" value={clinic.phone} onChange={e => setClinic(c => ({ ...c, phone: e.target.value }))} />
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Opening Time</label>
                  <input type="time" value={clinic.openingTime} onChange={e => setClinic(c => ({ ...c, openingTime: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Closing Time</label>
                  <input type="time" value={clinic.closingTime} onChange={e => setClinic(c => ({ ...c, closingTime: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">Working Days</label>
                <div className="flex gap-2 flex-wrap">
                  {days.map(d => (
                    <button key={d} type="button" onClick={() => toggleDay(d)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${clinic.workingDays.includes(d) ? 'border-primary-600 bg-primary-50 text-primary-600' : 'border-surface-200 text-text-muted hover:border-primary-300'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">About Clinic</label>
                <textarea value={clinic.about} onChange={e => setClinic(c => ({ ...c, about: e.target.value }))} rows={3}
                  className="w-full px-4 py-3 bg-white border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
                <Button loading={saving} icon={Save} onClick={handleSave}>Save Changes</Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <CardTitle className="mb-4">About Clinic</CardTitle>
            <p className="text-text-secondary text-sm leading-relaxed">{clinic.about}</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
