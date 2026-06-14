import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, Stethoscope, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import { cn } from '../../lib/utils'

const navLinks = [
  { href: '/',        label: 'Home',        anchor: null },
  { href: '/doctors', label: 'Find Doctors', anchor: null },
  { href: '#features', label: 'Features',   anchor: 'features' },
  { href: '#about',    label: 'About',      anchor: 'about' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, profile, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    setDropdownOpen(false)
    setMobileOpen(false)
    navigate('/login', { replace: true })
  }

  // Smooth-scroll to a section. If we're not on the homepage, navigate there first.
  const handleAnchorClick = (e, anchor) => {
    if (!anchor) return           // normal link — let React Router handle it
    e.preventDefault()
    setMobileOpen(false)

    const scrollTo = () => {
      const el = document.getElementById(anchor)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    if (location.pathname !== '/') {
      // navigate to home, then scroll after the page renders
      navigate('/')
      setTimeout(scrollTo, 400)
    } else {
      scrollTo()
    }
  }

  const dashboardPath = profile?.role
    ? profile.role === 'super_admin'
      ? '/super-admin/dashboard'
      : `/${profile.role}/dashboard`
    : '/patient/dashboard'

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-surface-200 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-bold text-xl">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-glow">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-gradient">DoctorHub</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.anchor ? (
                <button
                  key={link.href}
                  onClick={(e) => handleAnchorClick(e, link.anchor)}
                  className="px-4 py-2 text-text-secondary hover:text-primary-600 hover:bg-primary-50 font-medium rounded-xl transition-all duration-200 text-sm"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-4 py-2 text-text-secondary hover:text-primary-600 hover:bg-primary-50 font-medium rounded-xl transition-all duration-200 text-sm"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Auth Area */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <button className="relative p-2 hover:bg-surface-100 rounded-xl text-text-muted transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-600 rounded-full" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-surface-100 rounded-xl transition-colors"
                  >
                    <Avatar name={profile?.full_name || user.email} size="sm" src={profile?.avatar_url} />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-text-primary leading-none">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-text-muted capitalize mt-0.5">
                        {profile?.role?.replace('_', ' ') || 'Patient'}
                      </p>
                    </div>
                    <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', dropdownOpen && 'rotate-180')} />
                  </button>

                  {dropdownOpen && (
                    <>
                      {/* backdrop */}
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-large border border-surface-200 py-2 animate-slide-down z-20">
                        <Link
                          to={dashboardPath}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-50 text-text-secondary hover:text-primary-600 transition-colors text-sm"
                        >
                          <User className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <div className="border-t border-surface-200 my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 transition-colors text-sm"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 hover:bg-surface-100 rounded-xl transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-surface-200 animate-slide-down">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) =>
                link.anchor ? (
                  <button
                    key={link.href}
                    onClick={(e) => handleAnchorClick(e, link.anchor)}
                    className="px-4 py-3 text-text-secondary hover:text-primary-600 hover:bg-primary-50 font-medium rounded-xl transition-all text-left"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-text-secondary hover:text-primary-600 hover:bg-primary-50 font-medium rounded-xl transition-all"
                  >
                    {link.label}
                  </Link>
                )
              )}
              <div className="border-t border-surface-200 my-2" />
              {user ? (
                <>
                  <Link
                    to={dashboardPath}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-text-secondary hover:text-primary-600 hover:bg-primary-50 font-medium rounded-xl"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-3 text-red-600 hover:bg-red-50 font-medium rounded-xl text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-4">
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="secondary" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
