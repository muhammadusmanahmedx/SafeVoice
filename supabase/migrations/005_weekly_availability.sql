-- Counselor weekly recurring availability

CREATE TABLE counselor_weekly_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes SMALLINT NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (start_time < end_time)
);

CREATE INDEX idx_weekly_availability_faculty ON counselor_weekly_availability(counselor_id);

ALTER TABLE counselor_weekly_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view institution weekly availability"
  ON counselor_weekly_availability FOR SELECT
  USING (institution_id = get_user_institution_id());

CREATE POLICY "Counselor manage own weekly availability"
  ON counselor_weekly_availability FOR ALL
  USING (counselor_id = auth.uid())
  WITH CHECK (
    counselor_id = auth.uid()
    AND institution_id = get_user_institution_id()
    AND get_user_role() IN ('counselor', 'admin')
  );

GRANT ALL ON counselor_weekly_availability TO anon, authenticated, service_role;
