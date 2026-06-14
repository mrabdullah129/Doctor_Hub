import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Search, Calendar, FileText, Pill, MessageSquare,
  Users, Stethoscope, CreditCard, BarChart3, Clock, Building2,
  Shield, ActivitySquare, Lock, FileBarChart, LogOut, X, ChevronRight,
  UserCircle
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import Avatar from '../ui/Avatar'
import { cn } from '../../lib/utils'
import { NAVIGATION } from '../../lib/constants'

const iconMap = {
  LayoutDashboard, Search, Calendar, FileText, Pill, MessageSquare,
  Users, Stethoscope, CreditCard, BarChart3, Clock, Building2,
  Shield, ActivitySquare, Lock, FileBarChart, UserCircle,
}

export default function Sidebar({ open, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, user, logout } = useAuthStore()
  const role = profile?.role || 'patient'
  const navItems = NAVIGATION[role] || NAVIGATION.patient

  const handleLogout = async () => {
    await logout()
    onClose?.()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-white border-r border-surface-200 shadow-large z-40 flex flex-col transition-transform duration-300',
          'lg:translate-x-0 lg:z-20',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-200">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-lg">
            <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="text-gradient">DoctorHub</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 hover:bg-surface-100 rounded-lg text-text-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-surface-200">
          <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
            <Avatar
              name={profile?.full_name || user?.email}
              src={profile?.avatar_url}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-primary truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-text-muted capitalize mt-0.5">
                {role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard
              const isActive = location.pathname === item.path ||
                location.pathname.startsWith(item.path + '/')

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group',
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-text-secondary hover:text-primary-600 hover:bg-primary-50'
                  )}
                >
                  <Icon className={cn(
                    'w-4.5 h-4.5 flex-shrink-0',
                    isActive ? 'text-primary-600' : 'text-text-muted group-hover:text-primary-600'
                  )} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 text-primary-400" />}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-surface-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 font-medium text-sm transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
