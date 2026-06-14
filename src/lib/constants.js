export const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ASSISTANT: 'assistant',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
}

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  PAYMENT_UPLOADED: 'payment_uploaded',
  PAYMENT_VERIFIED: 'payment_verified',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
}

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
}

export const SPECIALIZATIONS = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'ENT Specialist',
  'Gynecologist',
  'Neurologist',
  'Oncologist',
  'Ophthalmologist',
  'Orthopedic Surgeon',
  'Pediatrician',
  'Psychiatrist',
  'Pulmonologist',
  'Radiologist',
  'Urologist',
  'Endocrinologist',
  'Gastroenterologist',
  'Hematologist',
  'Nephrologist',
  'Rheumatologist',
  'Surgeon',
]

export const DISEASES = [
  'Diabetes',
  'Hypertension',
  'Heart Disease',
  'Asthma',
  'Arthritis',
  'Cancer',
  'Depression',
  'Anxiety',
  'Migraine',
  'Thyroid',
  'Kidney Disease',
  'Liver Disease',
  'Skin Disease',
  'Eye Disease',
  'Ear Infection',
  'Respiratory Issues',
  'Digestive Problems',
  'Neurological Disorders',
  'Bone & Joint Issues',
  'Hormonal Imbalance',
]

export const TREATMENT_TYPES = [
  { value: 'allopathic', label: 'Allopathic' },
  { value: 'homeopathic', label: 'Homeopathic' },
  { value: 'herbal', label: 'Herbal' },
]

export const CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
]

export const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
]

export const STATS = {
  totalDoctors: 500,
  totalPatients: 25000,
  totalAppointments: 100000,
  successRate: 98,
}

export const NAVIGATION = {
  patient: [
    { path: '/patient/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/patient/search', label: 'Find Doctors', icon: 'Search' },
    { path: '/patient/appointments', label: 'Appointments', icon: 'Calendar' },
    { path: '/patient/medical-history', label: 'Medical History', icon: 'FileText' },
    { path: '/patient/prescriptions', label: 'Prescriptions', icon: 'Pill' },
    { path: '/patient/messages', label: 'Messages', icon: 'MessageSquare' },
  ],
  doctor: [
    { path: '/doctor/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/doctor/appointments', label: 'Appointments', icon: 'Calendar' },
    { path: '/doctor/patients', label: 'My Patients', icon: 'Users' },
    { path: '/doctor/prescriptions', label: 'Prescriptions', icon: 'Pill' },
    { path: '/doctor/schedule', label: 'Schedule', icon: 'Clock' },
    { path: '/doctor/clinic', label: 'Clinic', icon: 'Building2' },
    { path: '/doctor/profile', label: 'Profile', icon: 'Users' },
    { path: '/doctor/analytics', label: 'Analytics', icon: 'BarChart3' },
    { path: '/doctor/messages', label: 'Messages', icon: 'MessageSquare' },
  ],
  assistant: [
    { path: '/assistant/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/assistant/payments', label: 'Payment Queue', icon: 'CreditCard' },
    { path: '/assistant/appointments', label: 'Appointments', icon: 'Calendar' },
    { path: '/assistant/analytics', label: 'Analytics', icon: 'BarChart3' },
  ],
  admin: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/admin/users', label: 'Users', icon: 'Users' },
    { path: '/admin/doctors', label: 'Doctors', icon: 'Stethoscope' },
    { path: '/admin/appointments', label: 'Appointments', icon: 'Calendar' },
    { path: '/admin/reports', label: 'Reports', icon: 'FileBarChart' },
    { path: '/admin/analytics', label: 'Analytics', icon: 'BarChart3' },
  ],
  super_admin: [
    { path: '/super-admin/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/super-admin/users', label: 'User Management', icon: 'Users' },
    { path: '/admin/doctors', label: 'Doctors', icon: 'Stethoscope' },
    { path: '/super-admin/roles', label: 'Role Management', icon: 'Shield' },
    { path: '/super-admin/audit', label: 'Audit Logs', icon: 'ActivitySquare' },
    { path: '/super-admin/security', label: 'Security', icon: 'Lock' },
    { path: '/super-admin/analytics', label: 'Analytics', icon: 'BarChart3' },
  ],
}
