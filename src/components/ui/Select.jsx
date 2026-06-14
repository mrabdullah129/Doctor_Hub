import { cn } from '../../lib/utils'
import { ChevronDown, AlertCircle } from 'lucide-react'

export default function Select({
  label,
  error,
  options = [],
  placeholder = 'Select option',
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
        <select
          className={cn(
            'w-full px-4 py-3 bg-white border rounded-xl text-text-primary appearance-none focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 pr-10',
            error
              ? 'border-red-300 focus:ring-red-500'
              : 'border-surface-200 focus:ring-primary-500',
            className
          )}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value || opt} value={opt.value || opt}>
              {opt.label || opt}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
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
