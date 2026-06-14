-- ============================================================
-- Set roles for specific users by email
-- Run this in Supabase SQL Editor
-- ============================================================

-- Set assistant@gmail.com → role: assistant
UPDATE public.profiles
SET role = 'assistant',
    full_name = COALESCE(NULLIF(full_name, ''), 'Assistant'),
    updated_at = NOW()
WHERE email = 'assistant@gmail.com';

-- ── Verify the update ─────────────────────────────────────────
SELECT id, email, full_name, role, is_active, created_at
FROM public.profiles
WHERE email = 'assistant@gmail.com';
