-- Production assistant accounts and permissions

ALTER TABLE public.assistants
  ADD COLUMN IF NOT EXISTS username TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS assistants_username_key
  ON public.assistants (LOWER(username))
  WHERE username IS NOT NULL;

ALTER TABLE public.assistants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "assistants_select_own_or_doctor" ON public.assistants;
DROP POLICY IF EXISTS "assistants_update_doctor" ON public.assistants;

CREATE POLICY "assistants_select_own_or_doctor" ON public.assistants
  FOR SELECT USING (
    profile_id = auth.uid()
    OR doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid())
    OR public.current_user_is_admin()
  );

CREATE POLICY "assistants_update_doctor" ON public.assistants
  FOR UPDATE USING (
    doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid())
    OR public.current_user_is_admin()
  )
  WITH CHECK (
    doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid())
    OR public.current_user_is_admin()
  );

DROP POLICY IF EXISTS "profiles_select_doctor_assistants" ON public.profiles;

CREATE POLICY "profiles_select_doctor_assistants" ON public.profiles
  FOR SELECT USING (
    id IN (
      SELECT a.profile_id
      FROM public.assistants a
      JOIN public.doctors d ON d.id = a.doctor_id
      WHERE d.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "appointments_select_own" ON public.appointments;
DROP POLICY IF EXISTS "appointments_update_doctor_or_assistant" ON public.appointments;

CREATE POLICY "appointments_select_own" ON public.appointments
  FOR SELECT USING (
    patient_id = auth.uid()
    OR doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid())
    OR doctor_id IN (
      SELECT doctor_id FROM public.assistants
      WHERE profile_id = auth.uid() AND is_active = true
    )
    OR public.current_user_is_admin()
  );

CREATE POLICY "appointments_update_doctor_or_assistant" ON public.appointments
  FOR UPDATE USING (
    doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid())
    OR doctor_id IN (
      SELECT doctor_id FROM public.assistants
      WHERE profile_id = auth.uid() AND is_active = true
    )
    OR public.current_user_is_admin()
  )
  WITH CHECK (
    doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid())
    OR doctor_id IN (
      SELECT doctor_id FROM public.assistants
      WHERE profile_id = auth.uid() AND is_active = true
    )
    OR public.current_user_is_admin()
  );

DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
DROP POLICY IF EXISTS "payments_update_assistant_or_doctor" ON public.payments;

CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT USING (
    patient_id = auth.uid()
    OR appointment_id IN (
      SELECT id FROM public.appointments
      WHERE doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid())
    )
    OR appointment_id IN (
      SELECT appt.id
      FROM public.appointments appt
      JOIN public.assistants a ON a.doctor_id = appt.doctor_id
      WHERE a.profile_id = auth.uid() AND a.is_active = true
    )
    OR public.current_user_is_admin()
  );

CREATE POLICY "payments_update_assistant_or_doctor" ON public.payments
  FOR UPDATE USING (
    appointment_id IN (
      SELECT id FROM public.appointments
      WHERE doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid())
    )
    OR appointment_id IN (
      SELECT appt.id
      FROM public.appointments appt
      JOIN public.assistants a ON a.doctor_id = appt.doctor_id
      WHERE a.profile_id = auth.uid() AND a.is_active = true
    )
    OR public.current_user_is_admin()
  )
  WITH CHECK (
    appointment_id IN (
      SELECT id FROM public.appointments
      WHERE doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid())
    )
    OR appointment_id IN (
      SELECT appt.id
      FROM public.appointments appt
      JOIN public.assistants a ON a.doctor_id = appt.doctor_id
      WHERE a.profile_id = auth.uid() AND a.is_active = true
    )
    OR public.current_user_is_admin()
  );

SELECT 'Part 5 complete: production assistant auth and RLS configured.' AS status;
