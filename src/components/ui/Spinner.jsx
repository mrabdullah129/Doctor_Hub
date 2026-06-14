import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function Spinner({ size = 'md', className, fullPage = false }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center shadow-glow">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-text-secondary font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Loader2
      className={cn('animate-spin text-primary-600', sizes[size], className)}
    />
  )
}
