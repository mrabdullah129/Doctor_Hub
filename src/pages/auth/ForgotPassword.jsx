import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, Stethoscope, CheckCircle2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const { forgotPassword, loading } = useAuthStore()
  const { register, handleSubmit, getValues } = useForm()

  const onSubmit = async (data) => {
    const result = await forgotPassword(data.email)
    if (result.success) {
      setSent(true)
    } else {
      toast.error(result.error || 'Failed to send reset email')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-glow">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-gradient">DoctorHub</span>
        </div>

        <div className="card shadow-large">
          {!sent ? (
            <>
              <div className="mb-7">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
                  <Mail className="w-7 h-7 text-primary-600" />
                </div>
                <h1 className="text-2xl font-bold text-text-primary">Reset your password</h1>
                <p className="text-text-muted mt-2 text-sm">
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  icon={Mail}
                  {...register('email', { required: true })}
                />
                <Button type="submit" loading={loading} className="w-full" size="lg">
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-secondary-50 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-secondary-500" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Check your email</h2>
              <p className="text-text-muted text-sm">
                We sent a password reset link to <strong className="text-text-primary">{getValues('email')}</strong>
              </p>
              <p className="text-text-muted text-sm mt-3">
                Didn't receive it?{' '}
                <button
                  onClick={() => setSent(false)}
                  className="text-primary-600 font-semibold hover:underline"
                >
                  Try again
                </button>
              </p>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-surface-200 text-center">
            <Link to="/login"
              className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary-600 transition-colors font-medium">
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
