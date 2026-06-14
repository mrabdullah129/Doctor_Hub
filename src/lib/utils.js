import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isTomorrow, parseISO } from 'date-fns'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date, formatStr = 'MMM dd, yyyy') {
  if (!date) return ''
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, formatStr)
  } catch {
    return ''
  }
}

export function formatTime(date) {
  if (!date) return ''
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, 'hh:mm a')
  } catch {
    return ''
  }
}

export function formatRelative(date) {
  if (!date) return ''
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    if (isToday(d)) return `Today at ${format(d, 'hh:mm a')}`
    if (isTomorrow(d)) return `Tomorrow at ${format(d, 'hh:mm a')}`
    return formatDistanceToNow(d, { addSuffix: true })
  } catch {
    return ''
  }
}

export function formatCurrency(amount, currency = 'PKR') {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function truncate(str, length = 50) {
  if (!str) return ''
  return str.length > length ? `${str.slice(0, length)}...` : str
}

export function generateAvatarColor(name) {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700',
    'bg-orange-100 text-orange-700',
    'bg-teal-100 text-teal-700',
    'bg-pink-100 text-pink-700',
    'bg-indigo-100 text-indigo-700',
  ]
  if (!name) return colors[0]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

export function getStatusColor(status) {
  const map = {
    pending: 'badge-yellow',
    payment_uploaded: 'badge-blue',
    payment_verified: 'badge-blue',
    confirmed: 'badge-green',
    completed: 'badge-green',
    cancelled: 'badge-red',
    no_show: 'badge-gray',
    verified: 'badge-green',
    rejected: 'badge-red',
    active: 'badge-green',
    inactive: 'badge-gray',
  }
  return map[status] || 'badge-gray'
}

export function getStatusLabel(status) {
  const map = {
    pending: 'Pending',
    payment_uploaded: 'Payment Uploaded',
    payment_verified: 'Payment Verified',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No Show',
    verified: 'Verified',
    rejected: 'Rejected',
    active: 'Active',
    inactive: 'Inactive',
  }
  return map[status] || status
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function generateStars(rating) {
  return Array.from({ length: 5 }, (_, i) => i < Math.floor(rating))
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
