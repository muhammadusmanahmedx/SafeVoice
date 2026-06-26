-- Ensure counselor_weekly_availability exists (handles legacy faculty_* names or missing table)

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'faculty'
  ) THEN
    ALTER TYPE user_role RENAME VALUE 'faculty' TO 'counselor';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'people_involved' AND e.enumlabel = 'faculty'
  ) THEN
    ALTER TYPE people_involved RENAME VALUE 'faculty' TO 'counselor';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'sender_role' AND e.enumlabel = 'faculty'
  ) THEN
    ALTER TYPE sender_role RENAME VALUE 'faculty' TO 'counselor';
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.faculty_weekly_availability') IS NOT NULL
     AND to_regclass('public.counselor_weekly_availability') IS NULL THEN
    ALTER TABLE public.faculty_weekly_availability RENAME TO counselor_weekly_availability;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'counselor_weekly_availability'
      AND column_name = 'faculty_id'
  ) THEN
    ALTER TABLE public.counselor_weekly_availability RENAME COLUMN faculty_id TO counselor_id;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.counselor_weekly_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes SMALLINT NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS idx_weekly_availability_counselor
  ON public.counselor_weekly_availability(counselor_id);

ALTER TABLE public.counselor_weekly_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view institution weekly availability" ON public.counselor_weekly_availability;
DROP POLICY IF EXISTS "Counselor manage own weekly availability" ON public.counselor_weekly_availability;
DROP POLICY IF EXISTS "Counselors read own weekly availability" ON public.counselor_weekly_availability;
DROP POLICY IF EXISTS "Counselors manage own weekly availability" ON public.counselor_weekly_availability;

CREATE POLICY "Users view institution weekly availability"
  ON public.counselor_weekly_availability FOR SELECT
  USING (institution_id = get_user_institution_id());

CREATE POLICY "Counselor manage own weekly availability"
  ON public.counselor_weekly_availability FOR ALL
  USING (counselor_id = auth.uid())
  WITH CHECK (
    counselor_id = auth.uid()
    AND institution_id = get_user_institution_id()
    AND get_user_role()::text IN ('counselor', 'faculty', 'admin')
  );

GRANT ALL ON public.counselor_weekly_availability TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
