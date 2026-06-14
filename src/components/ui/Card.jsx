import { cn } from '../../lib/utils'

export default function Card({ children, className, hover = false, glass = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-surface-200 p-6',
        glass
          ? 'bg-white/70 backdrop-blur-lg border-white/50'
          : '',
        hover
          ? 'hover:shadow-medium transition-all duration-300 cursor-pointer hover:-translate-y-0.5 shadow-soft'
          : 'shadow-soft',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, action }) {
  return (
    <div className={cn('flex items-center justify-between mb-5', className)}>
      <div>{children}</div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-lg font-bold text-text-primary', className)}>
      {children}
    </h3>
  )
}

export function CardSubtitle({ children, className }) {
  return (
    <p className={cn('text-sm text-text-muted mt-0.5', className)}>
      {children}
    </p>
  )
}
