import { Star } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function StarRating({ rating = 0, max = 5, size = 'sm', showValue = false }) {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            sizes[size],
            i < Math.floor(rating)
              ? 'text-yellow-400 fill-yellow-400'
              : i < rating
              ? 'text-yellow-400 fill-yellow-200'
              : 'text-surface-200 fill-surface-200'
          )}
        />
      ))}
      {showValue && (
        <span className="text-sm font-semibold text-text-primary ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
