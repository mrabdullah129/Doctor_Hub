import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User, Phone, Stethoscope } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Please enter a valid phone number').optional().or(z.literal('')),
  role: z.enum(['patient', 'doctor']),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export default function Register() {
  const [showPass, setShowPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const { register: registerUser, loading } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'patient' },
  })

  const onSubmit = async (data) => {
    const result = await registerUser(data)
    if (result.success) {
      toast.success('Account created successfully!')
      navigate(`/${data.role}/dashboard`)
    } else {
      toast.error(result.error || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-glow">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-gradient">DoctorHub</span>
        </div>

        <div className="card shadow-large">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-text-primary">Create your account</h1>
            <p className="text-text-muted mt-1 text-sm">Join thousands of patients and doctors</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Dr. Ahmed Khan"
              icon={User}
              error={errors.full_name?.message}
              {...register('full_name')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+92 300 1234567"
              icon={Phone}
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Select
              label="I am a"
              options={[
                { value: 'patient', label: 'Patient - Looking for healthcare' },
                { value: 'doctor', label: 'Doctor - Providing healthcare' },
              ]}
              error={errors.role?.message}
              {...register('role')}
            />

            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              placeholder="At least 8 characters"
              icon={Lock}
              error={errors.password?.message}
              suffix={
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="text-text-muted hover:text-text-primary">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type={showConfirmPass ? 'text' : 'password'}
              placeholder="Repeat your password"
              icon={Lock}
              error={errors.confirmPassword?.message}
              suffix={
                <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="text-text-muted hover:text-text-primary">
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              {...register('confirmPassword')}
            />

            <p className="text-xs text-text-muted">
              By registering, you agree to our{' '}
              <Link to="/terms" className="text-primary-600 hover:underline">Terms</Link> and{' '}
              <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.
            </p>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <p className="text-center text-text-secondary mt-5 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
