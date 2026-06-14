import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
}) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-4xl',
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal box — max 90vh so it never goes off screen */}
      <div
        className={cn(
          'relative bg-white rounded-2xl shadow-large w-full animate-slide-up flex flex-col',
          'max-h-[90vh]',
          sizes[size]
        )}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200 flex-shrink-0">
            {title && (
              <h3 className="text-base font-bold text-text-primary">{title}</h3>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="ml-auto p-1.5 hover:bg-surface-100 rounded-xl text-text-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-5">
          {children}
        </div>
      </div>
    </div>
  )
}
