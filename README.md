# SafeVoice

AI-powered student wellbeing and safeguarding platform for schools, academies, and universities.

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** + ShadCN UI
- **Supabase** (Auth, PostgreSQL, RLS)
- **Claude API** via Vercel AI SDK
- **Recharts** for analytics
- **Jitsi Meet** for in-app counseling video (free, anonymous embeddable rooms via jitsi.riot.im)

## Getting Started

### Database migrations

Run migrations in order via the Supabase SQL Editor:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_safeguarding_features.sql` (auto-alerts, identity reveal, student announcements)
3. `supabase/migrations/003_counseling_bookings.sql` (counseling session booking)
4. `supabase/migrations/004_faculty_counseling_slots.sql` (only if you ran an older 003 with `counselor_name`)
5. `supabase/migrations/005_weekly_availability.sql` (weekly recurring hours)
6. `supabase/migrations/006_counseling_meetings.sql` (in-app video meeting support)
7. `supabase/seed.sql` for demo data

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial_schema.sql` via the SQL Editor
3. Run `supabase/seed.sql` for demo institutions and resources
4. Copy `.env.example` to `.env.local` and fill in your keys

Video counseling uses a free, embeddable **anonymous Jitsi** instance (`jitsi.riot.im`) by default — no signup, API keys, login, or "waiting for a moderator". Both faculty and student join the same booked room directly. Override the server with `JITSI_DOMAIN` if you prefer another instance. Note: `meet.jit.si` forces moderator login and `meet.ffmuc.net` blocks iframe embedding, so neither is suitable here.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## User Roles

| Role | Registration | Portal |
|------|-------------|--------|
| Student | `/register` — select institution | `/dashboard` |
| Faculty | `/faculty-register` — access code | `/faculty/dashboard` |
| Admin | Created via Supabase / seed | `/admin/dashboard` |

## Demo Faculty Codes (after seed)

- Riverside Academy: `FAC-DEMO-RV001`
- Northfield University: `FAC-DEMO-NF001`

## Deployment

1. Push to GitHub
2. Deploy to [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Add production URL to Supabase Auth redirect URLs

## Project Structure

```
src/
  app/
    (auth)/          # Login, register
    (student)/       # Student portal
    (faculty)/       # Faculty portal
    (admin)/         # Admin portal
    api/             # Chat, reports
  components/        # UI and feature components
  lib/               # Supabase, AI, auth, actions
supabase/
  migrations/        # Database schema + RLS
  seed.sql           # Demo data
```
