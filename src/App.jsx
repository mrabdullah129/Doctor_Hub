import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/authStore'
import ProtectedRoute from './components/auth/ProtectedRoute'

// ── Auth ──────────────────────────────────────────────────────
import Login           from './pages/auth/Login'
import Register        from './pages/auth/Register'
import ForgotPassword  from './pages/auth/ForgotPassword'

// ── Public ────────────────────────────────────────────────────
import Landing         from './pages/Landing'
import DoctorSearch    from './pages/doctors/DoctorSearch'
import BookAppointment from './pages/doctors/BookAppointment'
import NotFound        from './pages/NotFound'

// ── Patient ───────────────────────────────────────────────────
import PatientDashboard from './pages/patient/PatientDashboard'
import Appointments     from './pages/patient/Appointments'
import MedicalHistory   from './pages/patient/MedicalHistory'
import Prescriptions    from './pages/patient/Prescriptions'
import FindDoctors      from './pages/patient/FindDoctors'

// ── Doctor ────────────────────────────────────────────────────
import DoctorDashboard    from './pages/doctor/DoctorDashboard'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import CreatePrescription from './pages/doctor/CreatePrescription'
import MyPatients         from './pages/doctor/MyPatients'
import Schedule           from './pages/doctor/Schedule'
import Clinic             from './pages/doctor/Clinic'
import DoctorAnalytics    from './pages/doctor/Analytics'
import Profile            from './pages/doctor/Profile'

// ── Assistant ─────────────────────────────────────────────────
import AssistantDashboard     from './pages/assistant/AssistantDashboard'
import PaymentQueue           from './pages/assistant/PaymentQueue'
import AssistantAppointments  from './pages/assistant/AssistantAppointments'
import AssistantAnalytics     from './pages/assistant/AssistantAnalytics'

// ── Admin ─────────────────────────────────────────────────────
import AdminDashboard      from './pages/admin/AdminDashboard'
import UserManagement      from './pages/admin/UserManagement'
import DoctorVerification  from './pages/admin/DoctorVerification'
import AdminAppointments   from './pages/admin/AdminAppointments'
import Reports             from './pages/admin/Reports'
import AdminAnalytics      from './pages/admin/AdminAnalytics'

// ── Super Admin ───────────────────────────────────────────────
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard'
import UserManagementSA    from './pages/super-admin/UserManagementSA'
import RoleManagement      from './pages/super-admin/RoleManagement'
import AuditLogs           from './pages/super-admin/AuditLogs'
import Security            from './pages/super-admin/Security'

// ── Shared ────────────────────────────────────────────────────
import Messages from './pages/shared/Messages'

// ─────────────────────────────────────────────────────────────

const TOAST_OPTS = {
  duration: 4000,
  style: {
    background: '#fff',
    color: '#0f172a',
    borderRadius: '12px',
    boxShadow: '0 4px 25px -5px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    fontWeight: '500',
  },
  success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
  error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
}

function App() {
  const { initAuth } = useAuthStore()

  useEffect(() => { initAuth() }, [])

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={TOAST_OPTS} />

      <Routes>

        {/* ── Public ─────────────────────────────────────── */}
        <Route path="/"               element={<Landing />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/doctors"        element={<DoctorSearch />} />
        <Route path="/book/:doctorId" element={<BookAppointment />} />

        {/* ── Patient ────────────────────────────────────── */}
        <Route path="/patient/dashboard"      element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
        <Route path="/patient/search"         element={<ProtectedRoute allowedRoles={['patient']}><FindDoctors /></ProtectedRoute>} />
        <Route path="/patient/appointments"   element={<ProtectedRoute allowedRoles={['patient']}><Appointments /></ProtectedRoute>} />
        <Route path="/patient/medical-history" element={<ProtectedRoute allowedRoles={['patient']}><MedicalHistory /></ProtectedRoute>} />
        <Route path="/patient/prescriptions"  element={<ProtectedRoute allowedRoles={['patient']}><Prescriptions /></ProtectedRoute>} />
        <Route path="/patient/messages"       element={<ProtectedRoute allowedRoles={['patient']}><Messages /></ProtectedRoute>} />

        {/* ── Doctor ─────────────────────────────────────── */}
        <Route path="/doctor/dashboard"    element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
        <Route path="/doctor/patients"     element={<ProtectedRoute allowedRoles={['doctor']}><MyPatients /></ProtectedRoute>} />
        <Route path="/doctor/prescriptions" element={<ProtectedRoute allowedRoles={['doctor']}><CreatePrescription /></ProtectedRoute>} />
        <Route path="/doctor/schedule"     element={<ProtectedRoute allowedRoles={['doctor']}><Schedule /></ProtectedRoute>} />
        <Route path="/doctor/clinic"       element={<ProtectedRoute allowedRoles={['doctor']}><Clinic /></ProtectedRoute>} />
        <Route path="/doctor/profile"      element={<ProtectedRoute allowedRoles={['doctor']}><Profile /></ProtectedRoute>} />
        <Route path="/doctor/analytics"    element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAnalytics /></ProtectedRoute>} />
        <Route path="/doctor/messages"     element={<ProtectedRoute allowedRoles={['doctor']}><Messages /></ProtectedRoute>} />

        {/* ── Assistant ──────────────────────────────────── */}
        <Route path="/assistant/dashboard"    element={<ProtectedRoute allowedRoles={['assistant']}><AssistantDashboard /></ProtectedRoute>} />
        <Route path="/assistant/payments"     element={<ProtectedRoute allowedRoles={['assistant']}><PaymentQueue /></ProtectedRoute>} />
        <Route path="/assistant/appointments" element={<ProtectedRoute allowedRoles={['assistant']}><AssistantAppointments /></ProtectedRoute>} />
        <Route path="/assistant/analytics"   element={<ProtectedRoute allowedRoles={['assistant']}><AssistantAnalytics /></ProtectedRoute>} />

        {/* ── Admin ──────────────────────────────────────── */}
        <Route path="/admin/dashboard"    element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users"        element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/doctors"      element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><DoctorVerification /></ProtectedRoute>} />
        <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><AdminAppointments /></ProtectedRoute>} />
        <Route path="/admin/reports"      element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><Reports /></ProtectedRoute>} />
        <Route path="/admin/analytics"    element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><AdminAnalytics /></ProtectedRoute>} />

        {/* ── Super Admin ────────────────────────────────── */}
        <Route path="/super-admin/dashboard" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminDashboard /></ProtectedRoute>} />
        <Route path="/super-admin/users"     element={<ProtectedRoute allowedRoles={['super_admin']}><UserManagementSA /></ProtectedRoute>} />
        <Route path="/super-admin/roles"     element={<ProtectedRoute allowedRoles={['super_admin']}><RoleManagement /></ProtectedRoute>} />
        <Route path="/super-admin/audit"     element={<ProtectedRoute allowedRoles={['super_admin']}><AuditLogs /></ProtectedRoute>} />
        <Route path="/super-admin/security"  element={<ProtectedRoute allowedRoles={['super_admin']}><Security /></ProtectedRoute>} />
        <Route path="/super-admin/analytics" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><AdminAnalytics /></ProtectedRoute>} />

        {/* ── Helpers ────────────────────────────────────── */}
        <Route path="/dashboard" element={<RoleRedirect />} />

        {/* ── 404 ────────────────────────────────────────── */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  )
}

function RoleRedirect() {
  const { profile } = useAuthStore()
  const role = profile?.role || 'patient'
  const path = role === 'super_admin' ? '/super-admin/dashboard' : `/${role}/dashboard`
  return <Navigate to={path} replace />
}

export default App
