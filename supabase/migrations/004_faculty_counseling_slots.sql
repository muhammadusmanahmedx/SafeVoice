-- Migrate counseling slots from counselor_name to faculty-managed availability
-- Run only if you already applied an older version of 003_counseling_bookings.sql

ALTER TABLE counseling_slots
  ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Remove legacy seed slots that have no faculty owner
DELETE FROM counseling_slots WHERE faculty_id IS NULL;

ALTER TABLE counseling_slots DROP COLUMN IF EXISTS counselor_name;

-- Only enforce NOT NULL when no orphan rows remain
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM counseling_slots WHERE faculty_id IS NULL) THEN
    ALTER TABLE counseling_slots ALTER COLUMN faculty_id SET NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_counseling_slots_faculty ON counseling_slots(faculty_id);

DROP POLICY IF EXISTS "Admins manage counseling slots" ON counseling_slots;
DROP POLICY IF EXISTS "Faculty manage own counseling slots" ON counseling_slots;

CREATE POLICY "Faculty create own counseling slots"
  ON counseling_slots FOR INSERT
  WITH CHECK (
    faculty_id = auth.uid()
    AND institution_id = get_user_institution_id()
    AND get_user_role() IN ('faculty', 'admin')
  );

CREATE POLICY "Faculty update own counseling slots"
  ON counseling_slots FOR UPDATE
  USING (faculty_id = auth.uid());

CREATE POLICY "Faculty delete own counseling slots"
  ON counseling_slots FOR DELETE
  USING (faculty_id = auth.uid());

DROP POLICY IF EXISTS "Faculty view institution counseling bookings" ON counseling_bookings;

CREATE POLICY "Faculty view counseling bookings on their slots"
  ON counseling_bookings FOR SELECT
  USING (
    institution_id = get_user_institution_id()
    AND get_user_role() IN ('faculty', 'admin')
    AND slot_id IN (SELECT id FROM counseling_slots WHERE faculty_id = auth.uid())
  );
