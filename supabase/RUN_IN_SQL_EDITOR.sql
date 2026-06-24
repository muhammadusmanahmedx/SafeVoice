-- ============================================================
-- SafeVoice — run this entire file in Supabase SQL Editor
-- https://supabase.com/dashboard/project/inuuiabblxnrsdpummrw/sql/new
-- ============================================================


CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE user_role AS ENUM ('student', 'faculty', 'admin');
CREATE TYPE message_role AS ENUM ('user', 'assistant');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE risk_category AS ENUM (
  'anxiety', 'bullying', 'harassment', 'academic_stress',
  'mental_health', 'safety_concern', 'discrimination', 'other'
);
CREATE TYPE case_status AS ENUM ('new', 'in_progress', 'escalated', 'resolved', 'unsubstantiated');
CREATE TYPE people_involved AS ENUM ('student', 'faculty', 'group', 'unknown');
CREATE TYPE sender_role AS ENUM ('student', 'faculty');
CREATE TYPE reveal_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE resource_type AS ENUM ('article', 'video', 'helpline', 'institution');

-- Institutions (tenants)
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'student',
  display_name TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_institution ON profiles(institution_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Faculty registration codes
CREATE TABLE faculty_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMPTZ,
  used_by UUID REFERENCES profiles(id),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (institution_id, code)
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversations_student ON conversations(student_id);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);

-- Risk assessments
CREATE TABLE risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  risk_level risk_level NOT NULL DEFAULT 'low',
  category risk_category NOT NULL DEFAULT 'other',
  requires_attention BOOLEAN NOT NULL DEFAULT false,
  summary TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_risk_assessments_institution ON risk_assessments(institution_id);
CREATE INDEX idx_risk_assessments_level ON risk_assessments(risk_level);

-- Cases (incident reports)
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  incident_type risk_category NOT NULL,
  severity risk_level NOT NULL,
  summary TEXT NOT NULL,
  location TEXT,
  duration TEXT,
  people_involved people_involved DEFAULT 'unknown',
  others_affected BOOLEAN DEFAULT false,
  status case_status NOT NULL DEFAULT 'new',
  recommended_action TEXT DEFAULT 'Faculty review and follow-up.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cases_institution ON cases(institution_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_location ON cases(location);

-- Anonymous cases view (no student_id for faculty)
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
  created_at,
  updated_at
FROM cases;

-- Case messages
CREATE TABLE case_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  sender_role sender_role NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_case_messages_case ON case_messages(case_id);

-- Case notes (faculty internal)
CREATE TABLE case_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Identity reveal requests
CREATE TABLE identity_reveal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status reveal_status NOT NULL DEFAULT 'pending',
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mood logs
CREATE TABLE mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  mood SMALLINT NOT NULL CHECK (mood >= 1 AND mood <= 5),
  note TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mood_logs_student ON mood_logs(student_id);
CREATE INDEX idx_mood_logs_institution ON mood_logs(institution_id);

-- Resources
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type resource_type NOT NULL DEFAULT 'article',
  url TEXT,
  content TEXT,
  is_global BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_resources_institution ON resources(institution_id);
CREATE INDEX idx_resources_category ON resources(category);

-- Announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helper functions
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_institution_id()
RETURNS UUID AS $$
  SELECT institution_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Auto-create profile trigger (called from app after signup)
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Enable RLS
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_reveal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Institutions policies
CREATE POLICY "Users can view their institution"
  ON institutions FOR SELECT
  USING (id = get_user_institution_id());

CREATE POLICY "Anyone can view institutions for registration"
  ON institutions FOR SELECT
  TO anon
  USING (true);

-- Profiles policies
CREATE POLICY "Users can view profiles in their institution"
  ON profiles FOR SELECT
  USING (institution_id = get_user_institution_id());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins manage profiles in institution"
  ON profiles FOR ALL
  USING (
    institution_id = get_user_institution_id()
    AND get_user_role() = 'admin'
  );

-- Faculty codes
CREATE POLICY "Admins manage faculty codes"
  ON faculty_codes FOR ALL
  USING (
    institution_id = get_user_institution_id()
    AND get_user_role() = 'admin'
  );

CREATE POLICY "Anyone can validate faculty codes"
  ON faculty_codes FOR SELECT
  TO anon, authenticated
  USING (used_by IS NULL AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Users can redeem faculty codes"
  ON faculty_codes FOR UPDATE
  TO authenticated
  USING (used_by IS NULL AND (expires_at IS NULL OR expires_at > now()))
  WITH CHECK (used_by = auth.uid());

-- Service role inserts for AI chat (messages + risk assessments)
CREATE POLICY "Service role manages risk assessments"
  ON risk_assessments FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role manages assistant messages"
  ON messages FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Conversations
CREATE POLICY "Students manage own conversations"
  ON conversations FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "Faculty view institution conversations metadata"
  ON conversations FOR SELECT
  USING (
    institution_id = get_user_institution_id()
    AND get_user_role() IN ('faculty', 'admin')
  );

-- Messages
CREATE POLICY "Students manage messages in own conversations"
  ON messages FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE student_id = auth.uid()
    )
  );

-- Risk assessments
CREATE POLICY "Students view own risk assessments"
  ON risk_assessments FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "Faculty view institution risk assessments"
  ON risk_assessments FOR SELECT
  USING (
    institution_id = get_user_institution_id()
    AND get_user_role() IN ('faculty', 'admin')
  );

-- Cases - students see own, faculty see via anonymous view pattern
CREATE POLICY "Students manage own cases"
  ON cases FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "Faculty view institution cases"
  ON cases FOR SELECT
  USING (
    institution_id = get_user_institution_id()
    AND get_user_role() IN ('faculty', 'admin')
  );

CREATE POLICY "Faculty update institution cases"
  ON cases FOR UPDATE
  USING (
    institution_id = get_user_institution_id()
    AND get_user_role() IN ('faculty', 'admin')
  );

-- Case messages
CREATE POLICY "Students read/write case messages for own cases"
  ON case_messages FOR ALL
  USING (
    case_id IN (SELECT id FROM cases WHERE student_id = auth.uid())
  );

CREATE POLICY "Faculty manage case messages in institution"
  ON case_messages FOR ALL
  USING (
    case_id IN (
      SELECT id FROM cases
      WHERE institution_id = get_user_institution_id()
    )
    AND get_user_role() IN ('faculty', 'admin')
  );

-- Case notes
CREATE POLICY "Faculty manage case notes"
  ON case_notes FOR ALL
  USING (
    case_id IN (
      SELECT id FROM cases
      WHERE institution_id = get_user_institution_id()
    )
    AND get_user_role() IN ('faculty', 'admin')
  );

-- Identity reveal
CREATE POLICY "Students respond to reveal requests"
  ON identity_reveal_requests FOR SELECT
  USING (
    case_id IN (SELECT id FROM cases WHERE student_id = auth.uid())
  );

CREATE POLICY "Students update reveal requests"
  ON identity_reveal_requests FOR UPDATE
  USING (
    case_id IN (SELECT id FROM cases WHERE student_id = auth.uid())
  );

CREATE POLICY "Faculty create reveal requests"
  ON identity_reveal_requests FOR INSERT
  WITH CHECK (
    requested_by = auth.uid()
    AND get_user_role() IN ('faculty', 'admin')
  );

CREATE POLICY "Faculty view reveal requests"
  ON identity_reveal_requests FOR SELECT
  USING (
    case_id IN (
      SELECT id FROM cases
      WHERE institution_id = get_user_institution_id()
    )
    AND get_user_role() IN ('faculty', 'admin')
  );

-- Mood logs
CREATE POLICY "Students manage own mood logs"
  ON mood_logs FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "Admins view institution mood logs"
  ON mood_logs FOR SELECT
  USING (
    institution_id = get_user_institution_id()
    AND get_user_role() = 'admin'
  );

-- Resources
CREATE POLICY "Users view global and institution resources"
  ON resources FOR SELECT
  USING (
    is_global = true
    OR institution_id = get_user_institution_id()
    OR institution_id IS NULL
  );

CREATE POLICY "Admins manage institution resources"
  ON resources FOR ALL
  USING (
    institution_id = get_user_institution_id()
    AND get_user_role() = 'admin'
  );

CREATE POLICY "Anyone can view global resources"
  ON resources FOR SELECT
  TO anon
  USING (is_global = true);

-- Announcements
CREATE POLICY "Faculty and admins view announcements"
  ON announcements FOR SELECT
  USING (
    institution_id = get_user_institution_id()
    AND get_user_role() IN ('faculty', 'admin')
  );

CREATE POLICY "Admins manage announcements"
  ON announcements FOR ALL
  USING (
    institution_id = get_user_institution_id()
    AND get_user_role() = 'admin'
  );

-- Pattern detection function
CREATE OR REPLACE FUNCTION get_case_patterns(p_institution_id UUID, p_days INT DEFAULT 14)
RETURNS TABLE (
  location TEXT,
  incident_type risk_category,
  report_count BIGINT,
  latest_report TIMESTAMPTZ
) AS $$
  SELECT
    c.location,
    c.incident_type,
    COUNT(*) AS report_count,
    MAX(c.created_at) AS latest_report
  FROM cases c
  WHERE c.institution_id = p_institution_id
    AND c.created_at >= now() - (p_days || ' days')::interval
    AND c.location IS NOT NULL
  GROUP BY c.location, c.incident_type
  HAVING COUNT(*) >= 2
  ORDER BY report_count DESC;
$$ LANGUAGE sql SECURITY DEFINER;

-- API access grants (required for Supabase PostgREST)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON anonymous_cases TO anon, authenticated, service_role;
-- SafeVoice seed data for development/demo
-- Run after 001_initial_schema.sql

INSERT INTO institutions (id, name, slug, settings) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Riverside Academy', 'riverside-academy', '{"theme": "default"}'),
  ('22222222-2222-2222-2222-222222222222', 'Northfield University', 'northfield-university', '{"theme": "default"}');

-- Global resources (no institution_id, is_global = true)
INSERT INTO resources (institution_id, category, title, description, type, url, content, is_global) VALUES
  (NULL, 'anxiety', 'Managing Exam Anxiety', 'Practical strategies for coping with test-related stress', 'article', NULL, 'Deep breathing, preparation routines, and positive self-talk can help manage exam anxiety. Remember that one test does not define your worth.', true),
  (NULL, 'stress', '5-Minute Stress Relief', 'Quick techniques to calm your nervous system', 'article', NULL, 'Try box breathing: inhale 4 counts, hold 4, exhale 4, hold 4. Repeat 4 times.', true),
  (NULL, 'bullying', 'Understanding Bullying', 'What bullying looks like and how to respond', 'article', NULL, 'Bullying involves repeated harmful behavior. You deserve to feel safe. Speaking up â€” even anonymously â€” is a brave step.', true),
  (NULL, 'mental_health', 'Crisis Helpline', '24/7 support for anyone in crisis', 'helpline', 'tel:988', 'Call or text 988 for the Suicide & Crisis Lifeline. Available 24/7.', true),
  (NULL, 'burnout', 'Recognizing Burnout', 'Signs of academic burnout and recovery tips', 'video', 'https://www.youtube.com/watch?v=example', NULL, true),
  (NULL, 'confidence', 'Building Self-Confidence', 'Small steps to believe in yourself', 'article', NULL, 'Celebrate small wins. Challenge negative self-talk. Surround yourself with supportive people.', true),
  (NULL, 'study_habits', 'Effective Study Techniques', 'Evidence-based methods for better learning', 'article', NULL, 'Use spaced repetition, active recall, and regular breaks. Quality over quantity.', true);

-- Institution-specific resources
INSERT INTO resources (institution_id, category, title, description, type, url, is_global) VALUES
  ('11111111-1111-1111-1111-111111111111', 'institution', 'Riverside Counseling Center', 'On-campus counseling services', 'institution', 'https://riverside.edu/counseling', false),
  ('11111111-1111-1111-1111-111111111111', 'anxiety', 'Riverside Peer Support Group', 'Weekly peer support meetings', 'institution', 'https://riverside.edu/peer-support', false),
  ('22222222-2222-2222-2222-222222222222', 'institution', 'Northfield Wellbeing Hub', 'Student wellbeing services', 'institution', 'https://northfield.edu/wellbeing', false);

-- Faculty registration codes (for demo â€” use in faculty registration)
INSERT INTO faculty_codes (institution_id, code, expires_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'FAC-DEMO-RV001', now() + interval '365 days'),
  ('22222222-2222-2222-2222-222222222222', 'FAC-DEMO-NF001', now() + interval '365 days');

-- Note: User accounts must be created via Supabase Auth, then profiles inserted.
-- Demo accounts to create manually:
-- Student: student@riverside.demo / demo1234 â†’ profile with institution 11111111...
-- Faculty: Use code FAC-DEMO-RV001 during registration
-- Admin: Create via Supabase dashboard with role 'admin' in profiles table
