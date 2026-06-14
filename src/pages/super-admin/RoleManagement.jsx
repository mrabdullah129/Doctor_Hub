import { useState } from 'react'
import { Shield, Edit2, Save } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

const roleDefinitions = [
  {
    role: 'patient', label: 'Patient', color: 'gray',
    permissions: ['view_doctors', 'book_appointment', 'view_own_prescriptions', 'view_own_history', 'send_messages', 'upload_payment'],
  },
  {
    role: 'doctor', label: 'Doctor', color: 'blue',
    permissions: ['view_patients', 'create_prescription', 'append_medical_history', 'manage_schedule', 'manage_clinic', 'view_analytics', 'send_messages'],
  },
  {
    role: 'assistant', label: 'Assistant', color: 'teal',
    permissions: ['verify_payments', 'confirm_appointments', 'view_bookings', 'view_analytics'],
  },
  {
    role: 'admin', label: 'Admin', color: 'purple',
    permissions: ['manage_users', 'verify_doctors', 'view_all_appointments', 'view_reports', 'view_analytics'],
  },
  {
    role: 'super_admin', label: 'Super Admin', color: 'red',
    permissions: ['all_permissions', 'manage_roles', 'view_audit_logs', 'security_monitoring', 'system_config'],
  },
]

const permissionLabels = {
  view_doctors: 'View Doctors',
  book_appointment: 'Book Appointments',
  view_own_prescriptions: 'View Own Prescriptions',
  view_own_history: 'View Own Medical History',
  send_messages: 'Send Messages',
  upload_payment: 'Upload Payment',
  view_patients: 'View Patients',
  create_prescription: 'Create Prescriptions',
  append_medical_history: 'Append Medical History',
  manage_schedule: 'Manage Schedule',
  manage_clinic: 'Manage Clinic',
  view_analytics: 'View Analytics',
  verify_payments: 'Verify Payments',
  confirm_appointments: 'Confirm Appointments',
  view_bookings: 'View All Bookings',
  manage_users: 'Manage Users',
  verify_doctors: 'Verify Doctors',
  view_all_appointments: 'View All Appointments',
  view_reports: 'View Reports',
  all_permissions: 'All Permissions',
  manage_roles: 'Manage Roles',
  view_audit_logs: 'View Audit Logs',
  security_monitoring: 'Security Monitoring',
  system_config: 'System Configuration',
}

export default function RoleManagement() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Role Management</h1>
          <p className="text-text-muted mt-1">Define and manage platform role permissions</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {roleDefinitions.map(rd => (
            <Card key={rd.role}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <Badge variant={rd.color} className="text-sm">{rd.label}</Badge>
                    <p className="text-xs text-text-muted mt-0.5">{rd.permissions.length} permissions</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" icon={Edit2}
                  onClick={() => toast.success('Role editing coming in next version')}>
                  Edit
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {rd.permissions.map(p => (
                  <span key={p} className="text-xs bg-surface-100 text-text-secondary px-2.5 py-1 rounded-lg font-medium">
                    {permissionLabels[p] || p}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
