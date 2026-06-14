import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-soft hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
  secondary: 'inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-surface-50 text-primary-600 font-semibold rounded-xl border border-primary-200 transition-all duration-200 shadow-soft hover:shadow-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
  ghost: 'inline-flex items-center justify-center gap-2 px-4 py-2 text-text-secondary hover:text-primary-600 hover:bg-primary-50 font-medium rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
  danger: 'inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-soft focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
  success: 'inline-flex items-center justify-center gap-2 px-6 py-3 bg-secondary-500 hover:bg-secondary-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-soft focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
  outline: 'inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent hover:bg-surface-50 text-text-primary font-semibold rounded-xl border border-surface-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
}

const sizes = {
  sm: 'text-sm px-4 py-2 rounded-lg',
  md: 'text-sm',
  lg: 'text-base px-8 py-4 rounded-2xl',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  className,
  ...props
}) {
  return (
    <button
      className={cn(variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  )
}
