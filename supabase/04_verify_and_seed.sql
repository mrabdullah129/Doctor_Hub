-- ============================================================
-- DOCTORHUB - Part 4: Verify Setup + Fix Common Issues
-- Run this AFTER 01_tables.sql and 02_rls_and_triggers.sql
-- ============================================================

-- 1. Make sure doctors table has all needed columns
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS diseases TEXT[];

-- 2. Make specialization nullable (in case it's NOT NULL and causing issues)
ALTER TABLE public.doctors ALTER COLUMN specialization SET DEFAULT 'General Physician';

-- 3. Fix profiles table — make sure role column exists with correct values
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'patient';

-- 4. Set role for specific real users (update emails as needed)
UPDATE public.profiles SET role = 'assistant', updated_at = NOW()
  WHERE email = 'assistant@gmail.com';

-- Add more role assignments here as needed:
-- UPDATE public.profiles SET role = 'doctor',  updated_at = NOW() WHERE email = 'doctor@youremail.com';
-- UPDATE public.profiles SET role = 'admin',   updated_at = NOW() WHERE email = 'admin@youremail.com';

-- 5. Check what users exist
SELECT id, email, full_name, role, is_active, created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 20;

-- 6. Check what doctors exist
SELECT d.id, p.full_name, p.email, d.display_name, d.specialization, d.is_verified, d.is_available
FROM public.doctors d
JOIN public.profiles p ON d.profile_id = p.id
ORDER BY d.created_at DESC
LIMIT 20;

-- 7. Check appointments
SELECT
  a.id,
  a.status,
  a.appointment_date,
  a.appointment_time,
  patient.full_name AS patient_name,
  doc.display_name AS doctor_name
FROM public.appointments a
JOIN public.profiles patient ON a.patient_id = patient.id
JOIN public.doctors doc ON a.doctor_id = doc.id
ORDER BY a.created_at DESC
LIMIT 20;

-- 8. Check payments
SELECT
  p.id,
  p.status,
  p.amount,
  p.screenshot_url,
  p.created_at,
  a.appointment_date,
  pat.full_name AS patient_name
FROM public.payments p
JOIN public.appointments a ON p.appointment_id = a.id
JOIN public.profiles pat ON p.patient_id = pat.id
ORDER BY p.created_at DESC
LIMIT 20;
