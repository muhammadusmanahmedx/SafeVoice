-- Counseling session booking (faculty-managed availability)

CREATE TYPE booking_status AS ENUM ('booked', 'cancelled', 'completed');

CREATE TABLE counseling_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  counselor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slot_at TIMESTAMPTZ NOT NULL,
  duration_minutes SMALLINT NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_counseling_slots_institution ON counseling_slots(institution_id);
CREATE INDEX idx_counseling_slots_faculty ON counseling_slots(counselor_id);
CREATE INDEX idx_counseling_slots_slot_at ON counseling_slots(slot_at);

CREATE TABLE counseling_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES counseling_slots(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  topic TEXT,
  status booking_status NOT NULL DEFAULT 'booked',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slot_id)
);

CREATE INDEX idx_counseling_bookings_student ON counseling_bookings(student_id);
CREATE INDEX idx_counseling_bookings_institution ON counseling_bookings(institution_id);

ALTER TABLE counseling_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE counseling_bookings ENABLE ROW LEVEL SECURITY;

-- Slots: all institution users can view available times
CREATE POLICY "Users view institution counseling slots"
  ON counseling_slots FOR SELECT
  USING (institution_id = get_user_institution_id());

CREATE POLICY "Counselor create own counseling slots"
  ON counseling_slots FOR INSERT
  WITH CHECK (
    counselor_id = auth.uid()
    AND institution_id = get_user_institution_id()
    AND get_user_role() IN ('counselor', 'admin')
  );

CREATE POLICY "Counselor update own counseling slots"
  ON counseling_slots FOR UPDATE
  USING (counselor_id = auth.uid());

CREATE POLICY "Counselor delete own counseling slots"
  ON counseling_slots FOR DELETE
  USING (counselor_id = auth.uid());

CREATE POLICY "Admins manage institution counseling slots"
  ON counseling_slots FOR ALL
  USING (
    institution_id = get_user_institution_id()
    AND get_user_role() = 'admin'
  );

-- Bookings: students manage own
CREATE POLICY "Students view own counseling bookings"
  ON counseling_bookings FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students create own counseling bookings"
  ON counseling_bookings FOR INSERT
  WITH CHECK (
    student_id = auth.uid()
    AND institution_id = get_user_institution_id()
  );

CREATE POLICY "Students cancel own counseling bookings"
  ON counseling_bookings FOR UPDATE
  USING (student_id = auth.uid());

-- Counselor view bookings on their slots
CREATE POLICY "Counselor view counseling bookings on their slots"
  ON counseling_bookings FOR SELECT
  USING (
    institution_id = get_user_institution_id()
    AND get_user_role() IN ('counselor', 'admin')
    AND slot_id IN (SELECT id FROM counseling_slots WHERE counselor_id = auth.uid())
  );

GRANT ALL ON counseling_slots TO anon, authenticated, service_role;
GRANT ALL ON counseling_bookings TO anon, authenticated, service_role;
