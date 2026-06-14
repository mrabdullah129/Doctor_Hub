import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Calendar, Clock, Upload, CheckCircle2, ChevronRight,
  User, FileImage, AlertCircle, ArrowLeft, Lock, Stethoscope
} from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import StarRating from '../../components/ui/StarRating'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import useDoctorStore from '../../store/doctorStore'
import useAppointmentStore from '../../store/appointmentStore'
import { supabase } from '../../lib/supabase'
import { cn } from '../../lib/utils'
import { TIME_SLOTS } from '../../lib/constants'

const STEPS = [
  { id: 1, label: 'Doctor', icon: User },
  { id: 2, label: 'Date & Time', icon: Calendar },
  { id: 3, label: 'Payment', icon: Upload },
  { id: 4, label: 'Review', icon: CheckCircle2 },
]

const availableDates = Array.from({ length: 7 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() + i)
  return d
})

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, i) => {
        const isCompleted = step.id < currentStep
        const isCurrent = step.id === currentStep

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all',
                isCompleted ? 'bg-secondary-500 text-white' :
                isCurrent ? 'bg-primary-600 text-white shadow-glow' :
                'bg-surface-100 text-text-muted'
              )}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-4 h-4" />}
              </div>
              <span className={cn('text-xs font-medium hidden sm:block', isCurrent ? 'text-primary-600' : 'text-text-muted')}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('w-12 sm:w-20 h-0.5 mx-1 sm:mx-2 mb-5', step.id < currentStep ? 'bg-secondary-400' : 'bg-surface-200')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function BookAppointment() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const { verifiedDoctors } = useDoctorStore()
  const { addAppointment } = useAppointmentStore()

  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [paymentFile, setPaymentFile] = useState(null)
  const [paymentPreview, setPaymentPreview] = useState(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  // doctor resolved from Supabase or store
  const [doctor, setDoctor] = useState(null)
  const [doctorLoading, setDoctorLoading] = useState(true)

  // ── Auth guard ────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=/book/${doctorId}`, { replace: true })
    }
  }, [user, doctorId, navigate])

  // ── Load doctor: try Supabase first, fallback to store ───
  useEffect(() => {
    let cancelled = false

    async function loadDoctor() {
      setDoctorLoading(true)

      // Skip Supabase for demo users or store-only IDs (non-UUID)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(doctorId)

      if (isUUID && user && !user.isDemo) {
        try {
          const { data, error } = await supabase
            .from('doctors')
            .select('*')
            .eq('id', doctorId)
            .single()

          if (!cancelled && data && !error) {
            // Normalise Supabase doctor shape to match store shape
            setDoctor({
              supabaseId: data.id,
              id: data.id,
              name: data.display_name,
              specialty: data.specialization,
              fee: data.consultation_fee,
              bio: data.bio || '',
              city: data.city || '',
              experience: data.years_of_experience || 0,
              qualifications: data.qualifications || '',
              rating: data.rating || 0,
              reviews: data.total_reviews || 0,
              available: data.is_available,
            })
            setDoctorLoading(false)
            return
          }
        } catch {
          // fall through to store lookup
        }
      }

      // Fallback: find in doctorStore
      if (!cancelled) {
        const storeDoctor = verifiedDoctors.find(d => String(d.id) === String(doctorId))
        setDoctor(storeDoctor || null)
        setDoctorLoading(false)
      }
    }

    if (user) loadDoctor()
    return () => { cancelled = true }
  }, [doctorId, user, verifiedDoctors])

  if (!user) return null

  // Show spinner while loading doctor
  if (doctorLoading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  // Doctor not found
  if (!doctor) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-surface-100 flex items-center justify-center mx-auto mb-5">
            <Stethoscope className="w-10 h-10 text-surface-300" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Doctor not found</h2>
          <p className="text-text-muted mb-6">
            This doctor's profile could not be loaded. They may not be verified yet.
          </p>
          <Button onClick={() => navigate('/doctors')}>Browse Doctors</Button>
        </div>
      </div>
    )
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
      setPaymentFile(file)
      // Create preview URL for image files
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        setPaymentPreview(url)
      } else {
        setPaymentPreview(null)
      }
    }
  }

  const handleConfirm = async () => {
    setLoading(true)

    // ── Build local appointment object (saved to store always) ──
    const localAppointment = {
      id: 'apt-' + Date.now(),
      doctorId: doctor.id,
      doctorProfileId: doctor.profileId || doctor.supabaseId || null,
      doctor: doctor.name,
      specialty: doctor.specialty,
      city: doctor.city || '',
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime,
      status: 'payment_uploaded',
      fee: doctor.fee,
      reason: notes || 'General consultation',
      paymentScreenshot: paymentPreview || null,
      patientId: user.id,
      patientName: profile?.full_name || user?.email?.split('@')[0] || 'Patient',
      patientEmail: user?.email || null,
      createdAt: new Date().toISOString(),
    }

    try {
      // Skip Supabase for demo users — save only to local store
      if (user.isDemo) {
        await new Promise(r => setTimeout(r, 800))
        addAppointment(user.id, localAppointment)
        setLoading(false)
        setStep(5)
        toast.success('Appointment booked successfully!')
        return
      }

      // Try Supabase first
      try {
        const { data: appt, error: apptError } = await supabase
          .from('appointments')
          .insert({
            patient_id: user.id,
            doctor_id: doctor.supabaseId || doctor.id,
            appointment_date: selectedDate.toISOString().split('T')[0],
            appointment_time: selectedTime,
            status: 'payment_uploaded',
            reason: notes || 'General consultation',
            fee: doctor.fee,
          })
          .select()
          .single()

        if (!apptError && appt) {
          await supabase.from('payments').insert({
            appointment_id: appt.id,
            patient_id: user.id,
            amount: doctor.fee,
            payment_method: 'bank_transfer',
            screenshot_url: paymentPreview || 'pending_upload',
            status: 'pending',
          })
          // Use Supabase ID for the local record so status updates sync
          localAppointment.id = appt.id
          localAppointment.supabaseId = appt.id
        }
      } catch (supaErr) {
        console.warn('Supabase booking failed, saving locally only:', supaErr)
      }

      // Always save to local store so patient sees it immediately
      addAppointment(user.id, localAppointment)

      setLoading(false)
      setStep(5)
      toast.success('Appointment booked successfully!')
    } catch (err) {
      console.error('Booking error:', err)
      // Last resort — still save locally and show success
      addAppointment(user.id, localAppointment)
      setLoading(false)
      setStep(5)
      toast.success('Appointment booked!')
    }
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back */}
        <button
          onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary mb-6 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {step > 1 ? 'Previous step' : 'Back to search'}
        </button>

        <h1 className="text-2xl font-bold text-text-primary mb-2">Book Appointment</h1>
        <p className="text-text-muted mb-8">Complete the steps below to confirm your appointment</p>

        <StepIndicator currentStep={step} />

        {/* Success */}
        {step === 5 && (
          <Card className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-secondary-50 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-secondary-500" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Appointment Booked!</h2>
            <p className="text-text-muted mb-2">Your payment has been submitted for verification.</p>
            <p className="text-text-muted mb-8">You'll receive a confirmation once the assistant verifies your payment.</p>

            <div className="bg-surface-50 rounded-2xl p-5 mb-8 text-left max-w-sm mx-auto">
              <p className="font-bold text-text-primary mb-3">Booking Summary</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Doctor</span>
                  <span className="font-semibold text-text-primary">{doctor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Date</span>
                  <span className="font-semibold text-text-primary">
                    {selectedDate?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Time</span>
                  <span className="font-semibold text-text-primary">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Fee</span>
                  <span className="font-semibold text-primary-600">Rs {doctor.fee.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <Button variant="secondary" onClick={() => navigate('/patient/appointments')}>
                View Appointments
              </Button>
              <Button onClick={() => navigate('/doctors')}>
                Find More Doctors
              </Button>
            </div>
          </Card>
        )}

        {/* Step 1: Doctor Info */}
        {step === 1 && (
          <Card>
            <h2 className="text-lg font-bold text-text-primary mb-5">Your Selected Doctor</h2>
            <div className="flex gap-4 mb-6">
              <Avatar name={doctor.name} size="xl" />
              <div>
                <h3 className="text-xl font-bold text-text-primary">{doctor.name}</h3>
                <p className="text-text-muted text-sm">{doctor.qualifications}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="blue">{doctor.specialty}</Badge>
                  <span className="text-xs text-text-muted">{doctor.city}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <StarRating rating={doctor.rating} showValue />
                  <span className="text-xs text-text-muted">({doctor.reviews} reviews)</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-text-secondary leading-relaxed">
                {doctor.bio || doctor.about || `${doctor.name} is a ${doctor.specialty} with ${doctor.experience || 0} years of experience.`}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl border border-primary-100">
              <div>
                <p className="text-sm text-text-secondary font-medium">Consultation Fee</p>
                <p className="text-2xl font-bold text-primary-600">Rs {doctor.fee.toLocaleString()}</p>
              </div>
              <Badge variant="green">Per Session</Badge>
            </div>

            <Button className="w-full mt-6" onClick={() => setStep(2)}>
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Card>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <Card>
            <h2 className="text-lg font-bold text-text-primary mb-5">Select Date & Time</h2>

            <div className="mb-6">
              <p className="text-sm font-semibold text-text-secondary mb-3">Available Dates</p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {availableDates.map((date) => {
                  const isSelected = selectedDate?.toDateString() === date.toDateString()
                  const isToday = date.toDateString() === new Date().toDateString()
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        'flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-2xl border-2 w-16 transition-all',
                        isSelected
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-surface-200 hover:border-primary-300 bg-white'
                      )}
                    >
                      <span className={cn('text-xs font-medium', isSelected ? 'text-primary-600' : 'text-text-muted')}>
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className={cn('text-lg font-bold', isSelected ? 'text-primary-600' : 'text-text-primary')}>
                        {date.getDate()}
                      </span>
                      {isToday && (
                        <span className="text-xs text-secondary-500 font-semibold">Today</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedDate && (
              <div>
                <p className="text-sm font-semibold text-text-secondary mb-3">Available Time Slots</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={cn(
                        'p-2.5 rounded-xl text-sm font-medium border-2 transition-all',
                        selectedTime === slot
                          ? 'border-primary-600 bg-primary-50 text-primary-600'
                          : 'border-surface-200 hover:border-primary-300 text-text-secondary'
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">Back</Button>
              <Button
                className="flex-1"
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep(3)}
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <Card>
            <h2 className="text-lg font-bold text-text-primary mb-2">Upload Payment Proof</h2>
            <p className="text-text-muted text-sm mb-6">
              Please transfer Rs {doctor.fee.toLocaleString()} to the following account and upload a screenshot.
            </p>

            {/* Bank details */}
            <div className="bg-primary-50 rounded-2xl p-5 border border-primary-100 mb-6">
              <p className="font-bold text-text-primary mb-3">Payment Details</p>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Bank', value: 'HBL Bank' },
                  { label: 'Account Title', value: 'DoctorHub Healthcare' },
                  { label: 'Account Number', value: '0123-4567890-1' },
                  { label: 'Amount', value: `Rs ${doctor.fee.toLocaleString()}` },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-text-muted">{row.label}</span>
                    <span className="font-semibold text-text-primary">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* File upload */}
            <div className="mb-6">
              <label
                className={cn(
                  'flex flex-col items-center gap-3 border-2 border-dashed rounded-2xl cursor-pointer transition-all overflow-hidden',
                  paymentFile ? 'border-secondary-400 bg-secondary-50' : 'border-surface-200 hover:border-primary-400 hover:bg-primary-50'
                )}
              >
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                {paymentFile ? (
                  <div className="w-full">
                    {/* Show image preview if it's an image */}
                    {paymentPreview ? (
                      <div className="relative">
                        <img
                          src={paymentPreview}
                          alt="Payment screenshot"
                          className="w-full max-h-48 object-contain bg-white"
                        />
                        <div className="flex items-center justify-center gap-2 py-3 bg-secondary-50">
                          <CheckCircle2 className="w-4 h-4 text-secondary-500" />
                          <p className="text-sm font-semibold text-secondary-600">{paymentFile.name}</p>
                          <p className="text-xs text-text-muted">• Click to change</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 p-6">
                        <CheckCircle2 className="w-10 h-10 text-secondary-500" />
                        <p className="font-semibold text-secondary-600">{paymentFile.name}</p>
                        <p className="text-xs text-text-muted">Click to change file</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 p-8">
                    <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center">
                      <Upload className="w-7 h-7 text-text-muted" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-text-primary">Upload payment screenshot</p>
                      <p className="text-sm text-text-muted mt-1">PNG, JPG, or PDF up to 5MB</p>
                    </div>
                  </div>
                )}
              </label>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Notes for Doctor (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe your symptoms or reason for visit..."
                rows={3}
                className="w-full px-4 py-3 bg-white border border-surface-200 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">Back</Button>
              <Button
                className="flex-1"
                disabled={!paymentFile}
                onClick={() => setStep(4)}
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <Card>
            <h2 className="text-lg font-bold text-text-primary mb-5">Review Your Booking</h2>

            <div className="space-y-4">
              {/* Doctor */}
              <div className="flex items-center gap-3 p-4 bg-surface-50 rounded-xl">
                <Avatar name={doctor.name} size="md" />
                <div>
                  <p className="font-semibold text-text-primary">{doctor.name}</p>
                  <p className="text-sm text-text-muted">{doctor.specialty}</p>
                </div>
              </div>

              {/* Details */}
              {[
                { icon: Calendar, label: 'Date', value: selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) },
                { icon: Clock, label: 'Time', value: selectedTime },
                { icon: FileImage, label: 'Payment Proof', value: paymentFile?.name },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3 p-4 bg-surface-50 rounded-xl">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
                    <row.icon className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">{row.label}</p>
                    <p className="font-semibold text-text-primary text-sm">{row.value}</p>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl border border-primary-100">
                <span className="font-bold text-text-primary">Total Amount</span>
                <span className="text-xl font-bold text-primary-600">Rs {doctor.fee.toLocaleString()}</span>
              </div>

              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700">
                  Your appointment will be confirmed after the assistant verifies your payment. This usually takes 1-2 hours.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setStep(3)} className="flex-1">Back</Button>
              <Button loading={loading} className="flex-1" onClick={handleConfirm}>
                Confirm Booking
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
