// Redirect /patient/search → /doctors
import { Navigate } from 'react-router-dom'
export default function FindDoctors() {
  return <Navigate to="/doctors" replace />
}
