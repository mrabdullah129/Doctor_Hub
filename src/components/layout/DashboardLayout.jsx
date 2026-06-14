import { useState } from 'react'
import { Menu, Bell, Search } from 'lucide-react'
import Sidebar from './Sidebar'
import useAuthStore from '../../store/authStore'
import Avatar from '../ui/Avatar'

export default function DashboardLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { profile, user } = useAuthStore()

  return (
    <div className="min-h-screen bg-surface-50 flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-lg border-b border-surface-200 shadow-soft">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-surface-100 rounded-xl text-text-muted transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              {title && (
                <h1 className="text-lg font-bold text-text-primary hidden sm:block">{title}</h1>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Search - hidden on small screens */}
              <div className="hidden md:flex items-center gap-2 bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 w-56">
                <Search className="w-4 h-4 text-text-muted" />
                <input
                  placeholder="Quick search..."
                  className="bg-transparent text-sm text-text-primary placeholder-text-muted focus:outline-none w-full"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 hover:bg-surface-100 rounded-xl text-text-muted transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-600 rounded-full" />
              </button>

              {/* Avatar */}
              <div className="flex items-center gap-2">
                <Avatar
                  name={profile?.full_name || user?.email}
                  src={profile?.avatar_url}
                  size="sm"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-text-primary leading-none">
                    {profile?.full_name?.split(' ')[0] || 'User'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
