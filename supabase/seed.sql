-- SafeVoice seed data for development/demo
-- Run after 001_initial_schema.sql

INSERT INTO institutions (id, name, slug, settings) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Riverside Academy', 'riverside-academy', '{"theme": "default"}'),
  ('22222222-2222-2222-2222-222222222222', 'Northfield University', 'northfield-university', '{"theme": "default"}');

-- Global resources (no institution_id, is_global = true)
INSERT INTO resources (institution_id, category, title, description, type, url, content, is_global) VALUES
  (NULL, 'anxiety', 'Managing Exam Anxiety', 'Practical strategies for coping with test-related stress', 'article', NULL, 'Deep breathing, preparation routines, and positive self-talk can help manage exam anxiety. Remember that one test does not define your worth.', true),
  (NULL, 'stress', '5-Minute Stress Relief', 'Quick techniques to calm your nervous system', 'article', NULL, 'Try box breathing: inhale 4 counts, hold 4, exhale 4, hold 4. Repeat 4 times.', true),
  (NULL, 'bullying', 'Understanding Bullying', 'What bullying looks like and how to respond', 'article', NULL, 'Bullying involves repeated harmful behavior. You deserve to feel safe. Speaking up — even anonymously — is a brave step.', true),
  (NULL, 'mental_health', 'Crisis Helpline', '24/7 support for anyone in crisis', 'helpline', 'tel:988', 'Call or text 988 for the Suicide & Crisis Lifeline. Available 24/7.', true),
  (NULL, 'burnout', 'Recognizing Burnout', 'Signs of academic burnout and recovery tips', 'video', 'https://www.youtube.com/watch?v=example', NULL, true),
  (NULL, 'confidence', 'Building Self-Confidence', 'Small steps to believe in yourself', 'article', NULL, 'Celebrate small wins. Challenge negative self-talk. Surround yourself with supportive people.', true),
  (NULL, 'study_habits', 'Effective Study Techniques', 'Evidence-based methods for better learning', 'article', NULL, 'Use spaced repetition, active recall, and regular breaks. Quality over quantity.', true);

-- Institution-specific resources
INSERT INTO resources (institution_id, category, title, description, type, url, is_global) VALUES
  ('11111111-1111-1111-1111-111111111111', 'institution', 'Riverside Counseling Center', 'On-campus counseling services', 'institution', 'https://riverside.edu/counseling', false),
  ('11111111-1111-1111-1111-111111111111', 'anxiety', 'Riverside Peer Support Group', 'Weekly peer support meetings', 'institution', 'https://riverside.edu/peer-support', false),
  ('22222222-2222-2222-2222-222222222222', 'institution', 'Northfield Wellbeing Hub', 'Student wellbeing services', 'institution', 'https://northfield.edu/wellbeing', false);

-- Faculty registration codes (for demo — use in faculty registration)
INSERT INTO faculty_codes (institution_id, code, expires_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'FAC-DEMO-RV001', now() + interval '365 days'),
  ('22222222-2222-2222-2222-222222222222', 'FAC-DEMO-NF001', now() + interval '365 days');

-- Demo announcements
INSERT INTO announcements (institution_id, title, content, published_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Counseling Available This Week', 'The Riverside Counseling Center has extended hours this week. Walk-ins welcome Mon–Fri, 9am–5pm. Book a confidential session directly in SafeVoice.', now()),
  ('22222222-2222-2222-2222-222222222222', 'Wellbeing Hub Open House', 'Visit the Northfield Wellbeing Hub this Thursday for free stress-management workshops and peer support sessions. Book a counseling session in the app.', now());

-- Note: Counseling slots are created by faculty in the Faculty Portal → Counseling → My Availability

-- Note: User accounts must be created via Supabase Auth, then profiles inserted.
-- Demo accounts to create manually:
-- Student: student@riverside.demo / demo1234 → profile with institution 11111111...
-- Faculty: Use code FAC-DEMO-RV001 during registration
-- Admin: Create via Supabase dashboard with role 'admin' in profiles table
