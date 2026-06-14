-- DoctorHub Database Schema
-- Run this in Supabase SQL Editor to set up all tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================================
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

-- ============================================================
-- DOCTORS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name TEXT,
  city TEXT,
  specialization TEXT NOT NULL,
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

-- ============================================================
-- CLINICS TABLE
-- ============================================================
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

-- ============================================================
-- DOCTOR SCHEDULES TABLE
-- ============================================================
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

-- ============================================================
-- ASSISTANTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assistants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- APPOINTMENTS TABLE
-- ============================================================
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
  fee DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================
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

-- ============================================================
-- MEDICAL HISTORY TABLE (append-only, never deleteable)
-- ============================================================
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
  -- Note: NO updated_at column — immutable by design
);

-- ============================================================
-- PRESCRIPTIONS TABLE (immutable once created)
-- ============================================================
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
  -- Note: NO updated_at column — immutable by design
);

-- ============================================================
-- PRESCRIPTION MEDICINES TABLE (immutable)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.prescription_medicines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  strength TEXT,
  form TEXT DEFAULT 'Tablet',
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- Immutable — no updates allowed
);

-- ============================================================
-- MESSAGES TABLE
-- ============================================================
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

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
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

-- ============================================================
-- AUDIT LOGS TABLE (for super admin)
-- ============================================================
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

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile; admins can read all
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (public.current_user_is_admin());

CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (public.current_user_is_admin())
  WITH CHECK (public.current_user_is_admin());

-- Doctors: Anyone can view verified doctors
CREATE POLICY "doctors_select_all" ON public.doctors
  FOR SELECT USING (is_verified = true OR profile_id = auth.uid());

-- Admins can review, add/update, and activate doctor profiles
CREATE POLICY "doctors_admin_all" ON public.doctors
  FOR ALL USING (public.current_user_is_admin())
  WITH CHECK (public.current_user_is_admin());

-- Allow doctors to INSERT a row for themselves
CREATE POLICY "doctors_insert_own" ON public.doctors
  FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- Allow doctors to UPDATE their own row
CREATE POLICY "doctors_update_own" ON public.doctors
  FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Appointments: Patients see own, doctors see theirs
CREATE POLICY "appointments_select_own" ON public.appointments
  FOR SELECT USING (
    patient_id = auth.uid() OR
    doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid())
  );

CREATE POLICY "appointments_insert_patient" ON public.appointments
  FOR INSERT WITH CHECK (patient_id = auth.uid());

-- Medical history: Patients can view own, doctors can append
CREATE POLICY "medical_history_select_patient" ON public.medical_history
  FOR SELECT USING (patient_id = auth.uid() OR
    doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid()));

CREATE POLICY "medical_history_insert_doctor" ON public.medical_history
  FOR INSERT WITH CHECK (
    doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid())
  );

-- PREVENT deletion of medical history (enforced by RLS)
-- No DELETE policy means no one can delete

-- Prescriptions: Immutable view
CREATE POLICY "prescriptions_select_own" ON public.prescriptions
  FOR SELECT USING (patient_id = auth.uid() OR
    doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid()));

CREATE POLICY "prescriptions_insert_doctor" ON public.prescriptions
  FOR INSERT WITH CHECK (
    doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid())
  );

-- Doctors can create medicine rows only for prescriptions they issued
CREATE POLICY "prescription_medicines_select_own" ON public.prescription_medicines
  FOR SELECT USING (
    doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid())
    OR prescription_id IN (
      SELECT id FROM public.prescriptions
      WHERE patient_id = auth.uid()
    )
  );

CREATE POLICY "prescription_medicines_insert_doctor" ON public.prescription_medicines
  FOR INSERT WITH CHECK (
    doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid())
  );

-- PREVENT editing of prescriptions
-- No UPDATE policy means prescriptions are immutable

-- Messages
CREATE POLICY "messages_select_own" ON public.messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "messages_insert_own" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Notifications
CREATE POLICY "notifications_own" ON public.notifications
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Note: Replace with real auth users in production
-- These inserts are for demonstration only

COMMENT ON TABLE public.medical_history IS 'Medical history is append-only. RLS prevents deletion. Doctors can only add new records.';
COMMENT ON TABLE public.prescriptions IS 'Prescriptions are immutable. RLS prevents updates. Once issued, they cannot be changed.';
COMMENT ON TABLE public.prescription_medicines IS 'Medicine details are immutable once prescription is issued.';

-- ======================================
-- MIGRATIONS / BACKFILL (run in Supabase SQL editor)
-- ======================================

-- 1) Add columns to existing table (safe to run multiple times)
ALTER TABLE public.doctors
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT;

-- 2) Backfill display_name from profiles
UPDATE public.doctors d
SET display_name = p.full_name
FROM public.profiles p
WHERE d.profile_id = p.id
  AND (d.display_name IS NULL OR d.display_name = '');

-- 3) (Optional) Mark specific doctors verified so they appear in public searches
-- Replace the email below with the doctor's email or use profile_id directly
-- Example (mark doctor for 'doctor@example.com' as verified):
-- UPDATE public.doctors d
-- SET is_verified = true
-- FROM public.profiles p
-- WHERE d.profile_id = p.id AND p.email = 'doctor@example.com';

-- 4) If you prefer to allow doctors to create/update their rows via client-side code,
--    ensure the RLS policies above are applied in the DB (they're included earlier in this file).

-- After running the migration, test from the app: Save profile, then refresh and verify saved fields persist.
