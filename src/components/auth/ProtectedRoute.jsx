import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import Spinner from '../ui/Spinner'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuthStore()
  const location = useLocation()

  if (loading) return <Spinner fullPage />

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && profile?.role && !allowedRoles.includes(profile.role)) {
    const role = profile.role
    const dashboardPath = `/${role.replace('_', '-')}/dashboard`
    return <Navigate to={dashboardPath} replace />
  }

  return children
}
