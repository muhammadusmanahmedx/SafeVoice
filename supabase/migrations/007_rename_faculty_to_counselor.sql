-- Migrate legacy `faculty` role/value names to `counselor` (safe to re-run)

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

DO $$ BEGIN
  IF to_regclass('public.faculty_codes') IS NOT NULL
     AND to_regclass('public.counselor_codes') IS NULL THEN
    ALTER TABLE public.faculty_codes RENAME TO counselor_codes;
  END IF;
END $$;

DO $$ BEGIN
  IF to_regclass('public.faculty_weekly_availability') IS NOT NULL
     AND to_regclass('public.counselor_weekly_availability') IS NULL THEN
    ALTER TABLE public.faculty_weekly_availability RENAME TO counselor_weekly_availability;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'counseling_slots'
      AND column_name = 'faculty_id'
  ) THEN
    ALTER TABLE public.counseling_slots RENAME COLUMN faculty_id TO counselor_id;
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
