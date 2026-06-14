import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, Stethoscope, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function Login() {
  const [showPass, setShowPass] = useState(false)
  const { login, loading } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || null

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password)
    if (result.success) {
      toast.success('Welcome back!')
      const { profile } = useAuthStore.getState()
      const role = profile?.role || 'patient'
      // if there's a redirect param (e.g. from Book Now), go there
      if (redirectTo) {
        navigate(redirectTo)
      } else {
        const path = role === 'super_admin' ? '/super-admin/dashboard' : `/${role}/dashboard`
        navigate(path)
      }
    } else {
      toast.error(result.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 flex-col justify-center px-16 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">DoctorHub</span>
          </div>

          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Your Health Journey<br />
            <span className="text-primary-200">Starts Here</span>
          </h2>
          <p className="text-primary-100 text-lg leading-relaxed mb-10">
            Connect with top-rated doctors, manage appointments, and track your medical history — all in one place.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Verified Doctors', value: '500+' },
              { label: 'Happy Patients', value: '25K+' },
              { label: 'Appointments', value: '100K+' },
              { label: 'Success Rate', value: '98%' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-primary-200 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 justify-center mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">DoctorHub</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary">Welcome back</h1>
            <p className="text-text-muted mt-2">
              {redirectTo
                ? 'Please sign in to book your appointment.'
                : 'Sign in to your account to continue'}
            </p>
            {redirectTo && (
              <div className="mt-3 flex items-center gap-2 text-sm text-primary-700 bg-primary-50 border border-primary-100 rounded-xl px-4 py-2.5">
                <Lock className="w-4 h-4 flex-shrink-0" />
                You'll be taken back after signing in.
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              icon={Lock}
              error={errors.password?.message}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              {...register('password')}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-surface-200 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-text-secondary">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign In
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Demo accounts removed — use real Supabase accounts to sign in */}

          <p className="text-center text-text-secondary mt-6 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
