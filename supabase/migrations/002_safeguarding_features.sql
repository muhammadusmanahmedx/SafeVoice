-- SafeVoice safeguarding features: auto-alerts, identity reveal, student announcements

ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS identity_revealed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_alerted BOOLEAN NOT NULL DEFAULT false;

-- Recreate anonymous view (excludes student_id; includes new flags for faculty UI)
DROP VIEW IF EXISTS anonymous_cases;
CREATE VIEW anonymous_cases AS
SELECT
  id,
  institution_id,
  conversation_id,
  incident_type,
  severity,
  summary,
  location,
  duration,
  people_involved,
  others_affected,
  status,
  recommended_action,
  identity_revealed,
  auto_alerted,
  created_at,
  updated_at
FROM cases;

GRANT SELECT ON anonymous_cases TO anon, authenticated, service_role;

-- Students can read institution announcements
CREATE POLICY "Students view institution announcements"
  ON announcements FOR SELECT
  USING (
    institution_id = get_user_institution_id()
    AND get_user_role() = 'student'
  );
