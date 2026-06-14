import { cn, getInitials, generateAvatarColor } from '../../lib/utils'

const sizes = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-9 h-9 text-sm',
  md: 'w-11 h-11 text-base',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
  '2xl': 'w-28 h-28 text-3xl',
}

export default function Avatar({ src, name, size = 'md', className, online }) {
  const initials = getInitials(name)
  const colorClass = generateAvatarColor(name)

  return (
    <div className="relative inline-block">
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            'rounded-full object-cover',
            sizes[size],
            className
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-bold',
            sizes[size],
            colorClass,
            className
          )}
        >
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
            online ? 'bg-secondary-500' : 'bg-surface-200'
          )}
        />
      )}
    </div>
  )
}
