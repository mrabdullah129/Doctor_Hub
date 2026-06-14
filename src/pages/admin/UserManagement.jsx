import { useEffect, useState } from 'react'
import { Search, UserPlus, CheckCircle2, XCircle, Shield, Edit2, Trash2 } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { formatDate } from '../../lib/utils'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

const roleColor = { patient: 'gray', doctor: 'blue', assistant: 'teal', admin: 'purple', super_admin: 'red' }

export default function UserManagement() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, is_active, created_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      setUsers((data || []).map((user) => ({
        id: user.id,
        name: user.full_name || user.email || 'User',
        email: user.email || '',
        role: user.role || 'patient',
        status: user.is_active === false ? 'inactive' : 'active',
        joined: user.created_at,
      })))
    } catch (error) {
      toast.error(error.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleDeleteUser = async (user) => {
    const ok = globalThis.confirm(`Delete/deactivate ${user.name}?`)
    if (!ok) return

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (error) {
        const fallback = await supabase
          .from('profiles')
          .update({ is_active: false })
          .eq('id', user.id)
        if (fallback.error) throw fallback.error
        toast.success(`${user.name} deactivated`)
      } else {
        toast.success(`${user.name} deleted`)
      }

      loadUsers()
    } catch (error) {
      toast.error(error.message || 'Failed to delete user')
    }
  }

  const filtered = users.filter(u =>
    (roleFilter === 'all' || u.role === roleFilter) &&
    (!search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
            <p className="text-text-muted mt-1">
              {loading ? 'Loading users...' : `${users.length} total users on the platform`}
            </p>
          </div>
          <Button icon={UserPlus} onClick={() => toast.success('Invite user feature coming soon!')}>
            Invite User
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-white border border-surface-200 rounded-xl px-4 py-3 shadow-soft flex-1 max-w-sm">
            <Search className="w-4 h-4 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
              className="flex-1 bg-transparent text-sm focus:outline-none text-text-primary placeholder-text-muted" />
          </div>
          <div className="flex items-center gap-1 bg-surface-100 rounded-xl p-1">
            {['all', 'patient', 'doctor', 'assistant', 'admin'].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${roleFilter === r ? 'bg-white text-primary-600 shadow-soft' : 'text-text-muted hover:text-text-primary'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200">
                  {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider pb-3 pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-surface-50 transition-colors">
                    <td className="py-4 pr-6">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} size="sm" />
                        <div>
                          <p className="font-semibold text-text-primary text-sm">{u.name}</p>
                          <p className="text-xs text-text-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-6"><Badge variant={roleColor[u.role] || 'gray'}>{u.role}</Badge></td>
                    <td className="py-4 pr-6">
                      <Badge variant={u.status === 'active' ? 'green' : u.status === 'pending' ? 'yellow' : 'gray'} dot>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="py-4 pr-6 text-sm text-text-muted">{formatDate(u.joined)}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        {u.status === 'pending' && (
                          <>
                            <button onClick={() => toast.success(`${u.name} approved`)} className="p-1.5 hover:bg-secondary-50 text-secondary-600 rounded-lg transition-colors" title="Approve">
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => toast.error(`${u.name} rejected`)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors" title="Reject">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button className="p-1.5 hover:bg-primary-50 text-primary-600 rounded-lg transition-colors" title="Edit Role">
                          <Shield className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteUser(u)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors" title="Delete / Deactivate">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
