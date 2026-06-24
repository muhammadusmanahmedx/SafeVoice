# SafeVoice

AI-powered student wellbeing and safeguarding platform for schools, academies, and universities.

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** + ShadCN UI
- **Supabase** (Auth, PostgreSQL, RLS)
- **Claude API** via Vercel AI SDK
- **Recharts** for analytics

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial_schema.sql` via the SQL Editor
3. Run `supabase/seed.sql` for demo institutions and resources
4. Copy `.env.example` to `.env.local` and fill in your keys

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
