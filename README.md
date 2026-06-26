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

Video counseling uses a free, embeddable **anonymous Jitsi** instance (`jitsi.riot.im`) by default — no signup, API keys, login, or "waiting for a moderator". Both counselor and student join the same booked room directly. Override the server with `JITSI_DOMAIN` if you prefer another instance. Note: `meet.jit.si` forces moderator login and `meet.ffmuc.net` blocks iframe embedding, so neither is suitable here.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## User Roles

| Role | Registration | Portal |
|------|-------------|--------|
| Student | `/register` — select institution | `/dashboard` |
| Counselor | `/counselor-register` — access code | `/counselor/dashboard` |
| Admin | Created via Supabase / seed | `/admin/dashboard` |

## Demo Counselor Codes (after seed)

- Riverside Academy: `FAC-DEMO-RV001`
- Northfield University: `FAC-DEMO-NF001`

## Deployment

1. Push to GitHub
2. Deploy to [Vercel](https://vercel.com) (HTTPS is required for PWA install)
3. Set environment variables in Vercel dashboard
4. Configure Supabase Auth for your production domain (see below)
5. On a phone, open the deployed URL and install:
   - **Android (Chrome):** tap **Install app** when prompted, or use the in-app banner
   - **iPhone (Safari):** Share → **Add to Home Screen**

### Supabase Auth (production)

In **Supabase Dashboard → Authentication → URL Configuration**:

| Setting | Example |
|---------|---------|
| **Site URL** | `https://your-app.vercel.app` |
| **Redirect URLs** | `https://your-app.vercel.app/**` |

Also add `http://localhost:3000/**` for local development if not already present.

Cookie-based auth via middleware works in mobile Safari and Chrome when served over HTTPS.

### Progressive Web App

SafeVoice is an installable PWA (no App Store required). The service worker caches static assets only — chat and API routes always use the network.

- Manifest: `src/app/manifest.ts`
- Icons: `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png`
- Service worker: `@ducanh2912/next-pwa` (disabled in `npm run dev`, enabled on production build)

## Capacitor native app (App Store / Play Store)

SafeVoice can ship as a **native app** using [Capacitor](https://capacitorjs.com) in **remote WebView** mode: the app loads your deployed Vercel site inside a native shell. All server features (API routes, auth, chat, counseling video) work unchanged.

### 1. Deploy to Vercel first

1. Push to GitHub and connect the repo on [Vercel](https://vercel.com)
2. Set all environment variables from `.env.example`
3. In **Supabase → Authentication → URL Configuration**:
   - **Site URL:** `https://your-app.vercel.app`
   - **Redirect URLs:** `https://your-app.vercel.app/**`

### 2. Point Capacitor at production

Set your production URL before syncing native projects:

```bash
# Windows PowerShell
$env:CAPACITOR_SERVER_URL="https://your-app.vercel.app"
npm run cap:sync
```

Or add to `.env.local`:

```
CAPACITOR_SERVER_URL=https://your-app.vercel.app
```

Config lives in [`capacitor.config.ts`](capacitor.config.ts).

### 3. Open and run on device

```bash
npm run cap:android   # Android Studio → Run on device/emulator
npm run cap:ios       # Xcode on Mac → Run on simulator/device
```

**Local dev on device:** temporarily set `CAPACITOR_SERVER_URL=http://YOUR_LAN_IP:3000` and run `npm run dev`.

### Native permissions

Camera and microphone are declared for Jitsi counseling video:

- Android: `AndroidManifest.xml` (`CAMERA`, `RECORD_AUDIO`)
- iOS: `Info.plist` (`NSCameraUsageDescription`, `NSMicrophoneUsageDescription`)

### Store submission

- **Privacy policy:** https://your-app.vercel.app/privacy (required by both stores)
- **Google Play:** Build → Generate Signed Bundle (AAB) in Android Studio
- **Apple App Store:** Archive in Xcode (Mac required); declare camera/mic usage

### Device test checklist

1. App opens landing page from Vercel URL
2. Student login → dashboard
3. AI chat send/receive
4. Book counseling session
5. Join Jitsi video (camera + mic)
6. Counselor login → join same session
7. Android back button navigates correctly

PWA install prompts are hidden automatically inside the native app.

## Project Structure

```
capacitor.config.ts  # Native app config (remote Vercel URL)
android/             # Capacitor Android project
ios/                 # Capacitor iOS project (build on Mac)
resources/           # Source icon/splash for native assets
src/
  app/
    (auth)/          # Login, register
    (student)/       # Student portal
    (counselor)/       # Counselor portal
    (admin)/         # Admin portal
    api/             # Chat, reports
  components/        # UI and feature components
  lib/               # Supabase, AI, auth, actions
supabase/
  migrations/        # Database schema + RLS
  seed.sql           # Demo data
```
