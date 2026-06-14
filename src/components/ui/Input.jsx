import { cn } from '../../lib/utils'
import { AlertCircle } from 'lucide-react'

export default function Input({
  label,
  error,
  icon: Icon,
  suffix,
  className,
  containerClassName,
  ...props
}) {
  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label className="block text-sm font-semibold text-text-secondary mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          className={cn(
            'w-full px-4 py-3 bg-white border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200',
            error
              ? 'border-red-300 focus:ring-red-500'
              : 'border-surface-200 focus:ring-primary-500',
            Icon && 'pl-10',
            suffix && 'pr-10',
            className
          )}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  )
}
