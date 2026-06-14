import { cn } from '../../lib/utils'

const variants = {
  blue: 'bg-primary-50 text-primary-700',
  green: 'bg-secondary-50 text-secondary-600',
  yellow: 'bg-yellow-50 text-yellow-700',
  red: 'bg-red-50 text-red-700',
  gray: 'bg-surface-100 text-text-muted',
  purple: 'bg-purple-50 text-purple-700',
  teal: 'bg-teal-50 text-teal-700',
  orange: 'bg-orange-50 text-orange-700',
}

export default function Badge({ children, variant = 'gray', className, dot = false }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold',
        variants[variant],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', {
          'bg-primary-500': variant === 'blue',
          'bg-secondary-500': variant === 'green',
          'bg-yellow-500': variant === 'yellow',
          'bg-red-500': variant === 'red',
          'bg-slate-400': variant === 'gray',
        })} />
      )}
      {children}
    </span>
  )
}
