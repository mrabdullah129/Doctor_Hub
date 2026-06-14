import { useEffect, useState } from 'react'
import { Mail, User, Lock, UserPlus, Users, Stethoscope } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import useAuthStore from '../../store/authStore'
import {
  createAssistantAccount,
  getDoctorAssistants,
  getDoctorRecordForProfile,
} from '../../lib/assistantAccounts'
import toast from 'react-hot-toast'

const initialForm = {
  fullName: '',
  username: '',
  email: '',
  password: '',
}

export default function DoctorAssistants() {
  const { profile } = useAuthStore()
  const [form, setForm] = useState(initialForm)
  const [assistants, setAssistants] = useState([])
  const [doctorRecord, setDoctorRecord] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadAssistants = async () => {
    setLoading(true)
    try {
      const [record, list] = await Promise.all([
        getDoctorRecordForProfile(profile?.id),
        getDoctorAssistants(),
      ])
      setDoctorRecord(record)
      setAssistants(list)
    } catch (error) {
      toast.error(error.message || 'Failed to load assistants')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function loadInitialData() {
      setLoading(true)
      try {
        const [record, list] = await Promise.all([
          getDoctorRecordForProfile(profile?.id),
          getDoctorAssistants(),
        ])
        if (!cancelled) {
          setDoctorRecord(record)
          setAssistants(list)
        }
      } catch (error) {
        if (!cancelled) toast.error(error.message || 'Failed to load assistants')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadInitialData()
    return () => { cancelled = true }
  }, [profile?.id])

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.fullName.trim() || !form.username.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error('Please fill all assistant details')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setSaving(true)
    try {
      await createAssistantAccount({
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      setForm(initialForm)
      await loadAssistants()
      toast.success('Assistant created. They can login with username/email and password.')
    } catch (error) {
      toast.error(error.message || 'Failed to create assistant')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Assistants</h1>
          <p className="text-text-muted mt-1">
            Create login credentials for assistants who manage only your patients and appointments.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div>
                <CardTitle>Add Assistant</CardTitle>
                <p className="text-sm text-text-muted mt-0.5">Share these credentials with your assistant.</p>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <Input
                label="Assistant Name"
                placeholder="e.g., Fatima Malik"
                icon={User}
                value={form.fullName}
                onChange={(event) => update('fullName', event.target.value)}
              />
              <Input
                label="Username"
                placeholder="e.g., fatima_assistant"
                icon={UserPlus}
                value={form.username}
                onChange={(event) => update('username', event.target.value)}
              />
              <Input
                label="Email"
                type="email"
                placeholder="assistant@example.com"
                icon={Mail}
                value={form.email}
                onChange={(event) => update('email', event.target.value)}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Minimum 6 characters"
                icon={Lock}
                value={form.password}
                onChange={(event) => update('password', event.target.value)}
              />
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" icon={UserPlus} loading={saving}>
                  Create Assistant
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <CardTitle className="mb-4">Assigned Doctor</CardTitle>
            <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl border border-primary-100">
              <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-text-primary">
                  {doctorRecord?.display_name || profile?.full_name || 'Doctor'}
                </p>
                <p className="text-xs text-text-muted">
                  {doctorRecord?.specialization || 'Your appointments only'}
                </p>
              </div>
            </div>
            <p className="text-xs text-text-muted mt-4">
              Assistants created here will see appointments and payments linked to this doctor only.
            </p>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Your Assistants</CardTitle>
              <p className="text-sm text-text-muted mt-0.5">
                {loading ? 'Loading assistants...' : `${assistants.length} active assistant account(s)`}
              </p>
            </div>
          </CardHeader>

          {assistants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-surface-200 mx-auto mb-3" />
              <p className="font-bold text-text-primary">No assistants yet</p>
              <p className="text-sm text-text-muted mt-1">Create an assistant account from the form above.</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-100">
              {assistants.map((assistant) => (
                <div key={assistant.id} className="py-4 flex items-center gap-4 flex-wrap">
                  <Avatar name={assistant.full_name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text-primary">{assistant.full_name}</p>
                    <p className="text-sm text-text-muted">{assistant.email}</p>
                  </div>
                  <div className="text-sm text-text-secondary">
                    <span className="font-semibold">Username:</span> {assistant.username}
                  </div>
                  <Badge variant="teal">Active</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
