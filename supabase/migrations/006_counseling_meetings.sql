-- Counseling video meeting support

ALTER TABLE counseling_bookings
  ADD COLUMN IF NOT EXISTS meeting_room_name TEXT,
  ADD COLUMN IF NOT EXISTS meeting_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS meeting_ended_at TIMESTAMPTZ;

-- Counselor need UPDATE to mark sessions complete and record meeting timestamps
CREATE POLICY "Counselor update bookings on their slots"
  ON counseling_bookings FOR UPDATE
  USING (
    slot_id IN (
      SELECT id FROM counseling_slots WHERE counselor_id = auth.uid()
    )
  );
