-- Faculty weekly recurring availability

CREATE TABLE faculty_weekly_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes SMALLINT NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (start_time < end_time)
);

CREATE INDEX idx_weekly_availability_faculty ON faculty_weekly_availability(faculty_id);

ALTER TABLE faculty_weekly_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view institution weekly availability"
  ON faculty_weekly_availability FOR SELECT
  USING (institution_id = get_user_institution_id());

CREATE POLICY "Faculty manage own weekly availability"
  ON faculty_weekly_availability FOR ALL
  USING (faculty_id = auth.uid())
  WITH CHECK (
    faculty_id = auth.uid()
    AND institution_id = get_user_institution_id()
    AND get_user_role() IN ('faculty', 'admin')
  );

GRANT ALL ON faculty_weekly_availability TO anon, authenticated, service_role;
