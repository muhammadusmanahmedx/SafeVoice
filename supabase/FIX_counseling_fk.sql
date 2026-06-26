-- Fix legacy foreign-key names (faculty_id → counselor_id) for PostgREST joins
-- Safe to run more than once.

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'counseling_slots' AND column_name = 'faculty_id'
  ) THEN
    ALTER TABLE public.counseling_slots RENAME COLUMN faculty_id TO counselor_id;
  END IF;
END $$;

DO $$ BEGIN
  ALTER TABLE public.counseling_slots DROP CONSTRAINT IF EXISTS counseling_slots_faculty_id_fkey;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'counseling_slots_counselor_id_fkey'
  ) THEN
    ALTER TABLE public.counseling_slots
      ADD CONSTRAINT counseling_slots_counselor_id_fkey
      FOREIGN KEY (counselor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'counselor_weekly_availability'
      AND column_name = 'faculty_id'
  ) THEN
    ALTER TABLE public.counselor_weekly_availability RENAME COLUMN faculty_id TO counselor_id;
  END IF;
END $$;

DO $$ BEGIN
  ALTER TABLE public.counselor_weekly_availability
    DROP CONSTRAINT IF EXISTS faculty_weekly_availability_faculty_id_fkey;
  ALTER TABLE public.counselor_weekly_availability
    DROP CONSTRAINT IF EXISTS counselor_weekly_availability_faculty_id_fkey;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'counselor_weekly_availability_counselor_id_fkey'
  ) THEN
    ALTER TABLE public.counselor_weekly_availability
      ADD CONSTRAINT counselor_weekly_availability_counselor_id_fkey
      FOREIGN KEY (counselor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
