-- ============================================================
-- DOCTORHUB - Part 2: RLS Policies + Triggers + Functions
-- Paste this AFTER Part 1 in Supabase SQL Editor and click RUN
-- ============================================================

-- ── Enable RLS ───────────────────────────────────────────────
ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_history      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs           ENABLE ROW LEVEL SECURITY;

-- ── Helper: is current user admin? ───────────────────────────
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin') AND is_active = true
  );
$$;

-- ── PROFILES policies ─────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select_own"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;

CREATE POLICY "profiles_select_own"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own"   ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own"   ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT USING (public.current_user_is_admin());
CREATE POLICY "profiles_update_admin" ON public.profiles FOR UPDATE
  USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin());

-- ── DOCTORS policies ──────────────────────────────────────────
DROP POLICY IF EXISTS "doctors_select_all"   ON public.doctors;
DROP POLICY IF EXISTS "doctors_admin_all"    ON public.doctors;
DROP POLICY IF EXISTS "doctors_insert_own"   ON public.doctors;
DROP POLICY IF EXISTS "doctors_update_own"   ON public.doctors;

CREATE POLICY "doctors_select_all" ON public.doctors
  FOR SELECT USING (is_verified = true OR profile_id = auth.uid());
CREATE POLICY "doctors_admin_all" ON public.doctors
  FOR ALL USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin());
CREATE POLICY "doctors_insert_own" ON public.doctors
  FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "doctors_update_own" ON public.doctors
  FOR UPDATE USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

-- ── APPOINTMENTS policies ────────────────────────────────────
DROP POLICY IF EXISTS "appointments_select_own"    ON public.appointments;
DROP POLICY IF EXISTS "appointments_insert_patient" ON public.appointments;

CREATE POLICY "appointments_select_own" ON public.appointments
  FOR SELECT USING (
    patient_id = auth.uid() OR
    doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid())
  );
CREATE POLICY "appointments_insert_patient" ON public.appointments
  FOR INSERT WITH CHECK (patient_id = auth.uid());

-- ── PAYMENTS policies ─────────────────────────────────────────
DROP POLICY IF EXISTS "payments_select_own"   ON public.payments;
DROP POLICY IF EXISTS "payments_insert_own"   ON public.payments;

CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "payments_insert_own" ON public.payments
  FOR INSERT WITH CHECK (patient_id = auth.uid());

-- ── MEDICAL HISTORY policies (append-only) ───────────────────
DROP POLICY IF EXISTS "medical_history_select_patient" ON public.medical_history;
DROP POLICY IF EXISTS "medical_history_insert_doctor"  ON public.medical_history;

CREATE POLICY "medical_history_select_patient" ON public.medical_history
  FOR SELECT USING (
    patient_id = auth.uid() OR
    doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid())
  );
CREATE POLICY "medical_history_insert_doctor" ON public.medical_history
  FOR INSERT WITH CHECK (
    doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid())
  );
-- No DELETE policy = no one can delete medical history

-- ── PRESCRIPTIONS policies (immutable) ───────────────────────
DROP POLICY IF EXISTS "prescriptions_select_own"    ON public.prescriptions;
DROP POLICY IF EXISTS "prescriptions_insert_doctor" ON public.prescriptions;

CREATE POLICY "prescriptions_select_own" ON public.prescriptions
  FOR SELECT USING (
    patient_id = auth.uid() OR
    doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid())
  );
CREATE POLICY "prescriptions_insert_doctor" ON public.prescriptions
  FOR INSERT WITH CHECK (
    doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid())
  );
-- No UPDATE policy = prescriptions are immutable

-- ── MESSAGES policies ─────────────────────────────────────────
DROP POLICY IF EXISTS "messages_select_own" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_own" ON public.messages;

CREATE POLICY "messages_select_own" ON public.messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "messages_insert_own" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- ── NOTIFICATIONS policies ────────────────────────────────────
DROP POLICY IF EXISTS "notifications_own" ON public.notifications;
CREATE POLICY "notifications_own" ON public.notifications FOR ALL USING (user_id = auth.uid());

-- ── FUNCTIONS & TRIGGERS ─────────────────────────────────────

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at     ON public.profiles;
DROP TRIGGER IF EXISTS appointments_updated_at ON public.appointments;
DROP TRIGGER IF EXISTS doctors_updated_at      ON public.doctors;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile row when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Table comments
COMMENT ON TABLE public.medical_history IS
  'Append-only: no DELETE policy. Doctors can only add, never remove.';
COMMENT ON TABLE public.prescriptions IS
  'Immutable: no UPDATE policy. Cannot be changed after issue.';

SELECT 'Part 2 complete: RLS, triggers, and functions set up.' AS status;
