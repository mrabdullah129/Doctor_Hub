-- ============================================================
-- DOCTORHUB - Part 1: Tables + Extensions
-- Paste this in Supabase SQL Editor and click RUN
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'assistant', 'admin', 'super_admin')),
  avatar_url TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  city TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DOCTORS
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name TEXT,
  city TEXT,
  specialization TEXT NOT NULL DEFAULT 'General Physician',
  qualifications TEXT[],
  treatment_type TEXT DEFAULT 'allopathic' CHECK (treatment_type IN ('allopathic', 'homeopathic', 'herbal')),
  experience_years INTEGER DEFAULT 0,
  consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  bio TEXT,
  diseases TEXT[],
  languages TEXT[] DEFAULT ARRAY['Urdu', 'English'],
  is_verified BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_patients INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- APPOINTMENTS
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'payment_uploaded', 'payment_verified', 'confirmed', 'completed', 'cancelled', 'no_show')
  ),
  reason TEXT,
  notes TEXT,
  fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE UNIQUE NOT NULL,
  patient_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'bank_transfer',
  screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEDICAL HISTORY (append-only)
CREATE TABLE IF NOT EXISTS public.medical_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.profiles(id) NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id),
  appointment_id UUID REFERENCES public.appointments(id),
  diagnosis TEXT NOT NULL,
  treatment TEXT,
  type TEXT DEFAULT 'consultation' CHECK (type IN ('consultation', 'surgery', 'checkup', 'emergency', 'lab_test')),
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRESCRIPTIONS (immutable)
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.profiles(id) NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id),
  medical_history_id UUID REFERENCES public.medical_history(id),
  diagnosis TEXT NOT NULL,
  advice TEXT,
  follow_up TEXT,
  is_active BOOLEAN DEFAULT true,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRESCRIPTION MEDICINES (immutable)
CREATE TABLE IF NOT EXISTS public.prescription_medicines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  strength TEXT,
  form TEXT DEFAULT 'Tablet',
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) NOT NULL,
  content TEXT NOT NULL,
  attachment_url TEXT,
  attachment_type TEXT CHECK (attachment_type IN ('image', 'pdf', 'report', 'prescription')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'appointment', 'payment', 'message')),
  is_read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  level TEXT DEFAULT 'info' CHECK (level IN ('info', 'warning', 'danger', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLINICS
CREATE TABLE IF NOT EXISTS public.clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT,
  opening_time TIME,
  closing_time TIME,
  working_days TEXT[] DEFAULT ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SCHEDULES
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration INTEGER DEFAULT 30,
  max_patients INTEGER DEFAULT 20,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSISTANTS
CREATE TABLE IF NOT EXISTS public.assistants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  username TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backfill / safe migrations
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS city TEXT;

SELECT 'Part 1 complete: All tables created.' AS status;
