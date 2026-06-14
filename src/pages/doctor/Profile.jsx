import { useState, useEffect } from 'react'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardTitle } from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import useDoctorStore from '../../store/doctorStore'
import { SPECIALIZATIONS, CITIES, TREATMENT_TYPES } from '../../lib/constants'
import { supabase } from '../../lib/supabase'

export default function Profile() {
  const { profile } = useAuthStore()
  const { pendingDoctors, verifiedDoctors, submitDoctorProfile } = useDoctorStore()
  const [saving, setSaving] = useState(false)
  const [dbDoctor, setDbDoctor] = useState(null)

  // Check current status of this doctor
  const myPending  = pendingDoctors.find(d => d.profileId === profile?.id)
  const myVerified = verifiedDoctors.find(d => d.profileId === profile?.id)

  const [form, setForm] = useState({
    name:             profile?.full_name || '',
    specialization:   '',
    consultation_fee: '',
    bio:              '',
    city:             '',
    experience:       '',
    qualifications:   '',
    treatmentType:    'allopathic',
  })

  useEffect(() => {
    if (!profile?.id) return

    let mounted = true

    const loadDoctorProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .eq('profile_id', profile.id)
          .maybeSingle()

        if (error) throw error
        if (!mounted || !data) return

        setDbDoctor(data)
        setForm((f) => ({
          ...f,
          name: data.display_name || profile.full_name || f.name,
          specialization: data.specialization || f.specialization,
          consultation_fee: data.consultation_fee ?? f.consultation_fee,
          bio: data.bio || f.bio,
          city: data.city || f.city,
          experience: data.experience_years ?? f.experience,
          qualifications: Array.isArray(data.qualifications)
            ? data.qualifications.join(', ')
            : data.qualifications || f.qualifications,
          treatmentType: data.treatment_type || f.treatmentType,
        }))
      } catch (error) {
        console.warn('Unable to load doctor profile from Supabase.', error)
      }
    }

    loadDoctorProfile()
    return () => { mounted = false }
  }, [profile?.id, profile?.full_name])

  // Keep form in sync if store changes
  useEffect(() => {
    const src = myPending || myVerified
    if (src) {
      setForm(f => ({
        ...f,
        specialization:   src.specialty       || f.specialization,
        consultation_fee: src.fee             || f.consultation_fee,
        bio:              src.bio             || f.bio,
        city:             src.city            || f.city,
        experience:       src.experience      || f.experience,
        qualifications:   src.qualifications  || f.qualifications,
        treatmentType:    src.treatmentType   || f.treatmentType,
      }))
    }
  }, []) // run once on mount

  const upd = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSave = async () => {
    if (!form.specialization) { toast.error('Please select a specialization'); return }
    if (!form.consultation_fee) { toast.error('Please enter consultation fee'); return }

    setSaving(true)

    const qualifications = form.qualifications
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    const result = submitDoctorProfile({
      profileId:      profile?.id,
      name:           form.name,
      specialty:      form.specialization,
      fee:            Number(form.consultation_fee),
      bio:            form.bio,
      city:           form.city,
      experience:     Number(form.experience) || 0,
      qualifications: form.qualifications,
      treatmentType:  form.treatmentType,
      email:          profile?.email,
      phone:          profile?.phone,
    })

    try {
      const { data, error } = await supabase
        .from('doctors')
        .upsert({
          profile_id: profile?.id,
          display_name: form.name || profile?.full_name,
          specialization: form.specialization,
          consultation_fee: Number(form.consultation_fee) || 0,
          bio: form.bio || null,
          city: form.city || null,
          experience_years: Number(form.experience) || 0,
          qualifications: qualifications.length ? qualifications : null,
          treatment_type: form.treatmentType || 'allopathic',
          is_available: true,
        }, { onConflict: 'profile_id' })
        .select()
        .single()

      if (error) throw error
      setDbDoctor(data)
    } catch (error) {
      setSaving(false)
      toast.error(error.message || 'Failed to save profile')
      return
    }

    setSaving(false)

    if (result === 'updated') {
      toast.success('Profile updated successfully!')
    } else if (result === 'resubmitted') {
      toast.success('Profile re-submitted for admin review.')
    } else {
      toast.success('Profile submitted! Waiting for admin approval.')
    }
  }

  // ── Status banner ────────────────────────────────────────
  const StatusBanner = () => {
    if (myVerified || dbDoctor?.is_verified) return (
      <div className="flex items-center gap-3 p-4 bg-secondary-50 border border-secondary-200 rounded-2xl">
        <CheckCircle2 className="w-5 h-5 text-secondary-500 flex-shrink-0" />
        <div>
          <p className="font-semibold text-secondary-700 text-sm">Profile Verified ✓</p>
          <p className="text-xs text-secondary-600 mt-0.5">
            Your profile is live and patients can find you on DoctorHub.
          </p>
        </div>
      </div>
    )

    if (myPending) return (
      <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
        <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-yellow-700 text-sm">Pending Admin Approval</p>
          <p className="text-xs text-yellow-600 mt-0.5">
            Your profile has been submitted and is awaiting verification by an admin.
          </p>
        </div>
      </div>
    )

    return (
      <div className="flex items-center gap-3 p-4 bg-primary-50 border border-primary-100 rounded-2xl">
        <AlertCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-primary-700 text-sm">Complete Your Profile</p>
          <p className="text-xs text-primary-600 mt-0.5">
            Fill in your details and save. An admin will verify and activate your profile.
          </p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Profile</h1>
          <p className="text-text-muted mt-1">Set up your public doctor profile</p>
        </div>

        <StatusBanner />

        <Card>
          <CardTitle className="mb-5">Doctor Information</CardTitle>
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={form.name}
              onChange={upd('name')}
              placeholder="Dr. Your Name"
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Specialization *"
                options={SPECIALIZATIONS}
                value={form.specialization}
                onChange={upd('specialization')}
              />
              <Select
                label="Treatment Type"
                options={TREATMENT_TYPES}
                value={form.treatmentType}
                onChange={upd('treatmentType')}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Consultation Fee (PKR) *"
                type="number"
                value={form.consultation_fee}
                onChange={upd('consultation_fee')}
                placeholder="e.g. 2000"
              />
              <Input
                label="Experience (years)"
                type="number"
                value={form.experience}
                onChange={upd('experience')}
                placeholder="e.g. 10"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="City"
                options={CITIES}
                value={form.city}
                onChange={upd('city')}
              />
              <Input
                label="Qualifications"
                value={form.qualifications}
                onChange={upd('qualifications')}
                placeholder="e.g. MBBS, FCPS"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Biography
              </label>
              <textarea
                className="w-full px-4 py-3 bg-white border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows={4}
                value={form.bio}
                onChange={upd('bio')}
                placeholder="Tell patients about your expertise and approach..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Cancel
              </Button>
              <Button loading={saving} onClick={handleSave}>
                {myVerified || dbDoctor?.is_verified ? 'Update Profile' : 'Submit for Approval'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
