import Image from "next/image";
import Link from "next/link";
import {
  Shield, MessageCircle, Lock, Heart, BarChart3,
  ArrowRight, CheckCircle2, Users, TrendingUp, Eye, AlertTriangle
} from "lucide-react";

const IMAGES = {
  hero: "/images/hero.jpg",
  mission: "/images/mission.jpg",
  community: "/images/community.jpg",
  support: "/images/support.jpg",
  campus: "/images/campus.jpg",
} as const;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">

      {/* ── NAV ───────────────────────────────────────────── */}
      <header className="sticky top-5 z-50 mx-auto max-w-6xl px-6">
        <div className="flex h-[68px] items-center justify-between rounded-2xl border border-white/60 bg-white/90 px-6 shadow-sm backdrop-blur-md">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#193852]">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-[#0d0d0d]">SafeVoice</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-xl px-5 py-2 text-sm font-semibold text-[#0d0d0d] transition-colors hover:bg-gray-100 sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-[#a38016] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="mt-[-68px]">

        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-[68px]">
          <div className="relative mx-6 min-h-[640px] overflow-hidden rounded-3xl sm:mx-10 lg:mx-16">
            <Image
              src={IMAGES.hero}
              alt="Students studying together in a supportive environment"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-[#193852]/85 backdrop-blur-[2px]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:28px_28px]" />

            <div className="relative flex min-h-[640px] flex-col items-center justify-center px-6 py-28 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm text-white backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#a38016] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#a38016]" />
                </span>
                AI-powered student safeguarding
              </span>

              <h1 className="mt-8 max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Giving students a voice{" "}
                <span className="text-[#a38016]">before silence becomes a crisis.</span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
                A private, anonymous AI wellbeing platform. Students get 24/7 support.
                Institutions get early visibility into safeguarding concerns — all in one place.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/register"
                  className="flex items-center gap-2 rounded-full bg-[#a38016] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-opacity hover:opacity-90"
                >
                  Start as Student
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/faculty-register"
                  className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  Faculty Registration
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
                {["Fully anonymous", "24/7 available", "Zero data sharing"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#a38016]" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── MISSION & IMPACT ──────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-xl sm:aspect-[5/6] lg:aspect-auto lg:h-[560px]">
                <Image
                  src={IMAGES.mission}
                  alt="Diverse students collaborating and supporting each other"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {/* Floating stat card */}
              <div className="absolute -bottom-6 -right-4 rounded-2xl border border-white/20 bg-[#193852] p-5 shadow-2xl sm:right-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { n: "24/7", label: "AI Support" },
                    { n: "100%", label: "Anonymous" },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-2xl font-extrabold text-[#a38016]">{s.n}</p>
                      <p className="text-xs font-medium uppercase tracking-wider text-white/60">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#a38016]">Our Mission</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0d0d0d] sm:text-4xl">
                Support students before problems escalate
              </h2>
              <p className="mt-5 text-base leading-relaxed text-gray-500">
                Many students experience bullying, harassment, burnout, or anxiety but never seek help
                because they fear judgment or exposure. SafeVoice provides a private, supportive
                environment where they can talk to an AI that truly listens.
              </p>
              <p className="mt-4 text-base leading-relaxed text-gray-500">
                When patterns of concern emerge, faculty are notified with structured, anonymised
                reports — giving institutions an early warning system that protects students and staff alike.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  "Anonymous conversations with empathetic AI",
                  "Smart risk detection and structured escalation",
                  "Faculty visibility without identity exposure",
                  "Institution-wide safeguarding analytics",
                ].map((p) => (
                  <div key={p} className="flex items-center gap-2.5 text-sm text-[#0d0d0d]">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#a38016]/10">
                      <CheckCircle2 className="h-3 w-3 text-[#a38016]" />
                    </span>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── COMMUNITY VISUAL ──────────────────────────────── */}
        <section className="bg-[#f7f6f3] py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-14 text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-[#a38016]">Community & Support</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0d0d0d] sm:text-4xl">
                A safe space for every student
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-gray-500">
                Real support for real students — whether they need someone to listen, a place to report concerns, or guidance through difficult times.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <div className="relative overflow-hidden rounded-3xl lg:col-span-2 lg:row-span-2">
                <div className="relative aspect-[16/10] lg:h-full lg:min-h-[420px]">
                  <Image
                    src={IMAGES.community}
                    alt="Students walking together on campus"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#193852]/80 via-[#193852]/20 to-transparent" />
                  <div className="absolute bottom-0 p-8">
                    <p className="text-sm font-bold uppercase tracking-widest text-[#a38016]">Student wellbeing</p>
                    <h3 className="mt-2 text-2xl font-extrabold text-white">Every voice matters</h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-white/75">
                      Students can reach out anytime — no appointment needed, no fear of being judged.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl">
                <div className="relative aspect-[4/3] lg:h-[200px]">
                  <Image
                    src={IMAGES.support}
                    alt="Supportive conversation between student and counselor"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
                <div className="bg-white p-5">
                  <MessageCircle className="h-5 w-5 text-[#a38016]" />
                  <h3 className="mt-2 font-bold text-[#0d0d0d]">AI that listens</h3>
                  <p className="mt-1 text-sm text-gray-500">Warm, empathetic conversations available around the clock.</p>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl">
                <div className="relative aspect-[4/3] lg:h-[200px]">
                  <Image
                    src={IMAGES.campus}
                    alt="University campus building"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>
                <div className="bg-white p-5">
                  <Shield className="h-5 w-5 text-[#a38016]" />
                  <h3 className="mt-2 font-bold text-[#0d0d0d]">Institution-wide safety</h3>
                  <p className="mt-1 text-sm text-gray-500">Early detection and structured safeguarding for your entire campus.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES GRID ─────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-14 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[#a38016]">Platform Features</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0d0d0d] sm:text-4xl">
              Everything an institution needs
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: MessageCircle, title: "AI Wellbeing Chat", desc: "Empathetic 24/7 conversations. The AI listens, supports, and asks follow-up questions — never judges.", accent: "bg-blue-500/10 text-blue-600" },
              { icon: Lock, title: "Anonymous by Design", desc: "Student identity is never shared unless they choose. Consent-first at every step.", accent: "bg-green-500/10 text-green-600" },
              { icon: Heart, title: "Mood Tracking", desc: "Daily check-ins with AI-generated wellbeing insights to spot patterns before they worsen.", accent: "bg-rose-500/10 text-rose-600" },
              { icon: BarChart3, title: "Trend Analytics", desc: "Safeguarding dashboards with risk distribution, reported locations, and peak incident periods.", accent: "bg-amber-500/10 text-amber-600" },
            ].map((f) => (
              <div key={f.title} className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className={`mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl ${f.accent}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-[#0d0d0d]">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── QUOTE BAND ────────────────────────────────────── */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="relative min-h-[320px] overflow-hidden rounded-3xl">
              <Image
                src={IMAGES.campus}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
                aria-hidden
              />
              <div className="absolute inset-0 bg-[#193852]/88 backdrop-blur-sm" />
              <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/10" />

              <div className="relative p-12 text-center sm:p-16">
                <span className="inline-block text-5xl font-serif text-[#a38016] leading-none">&ldquo;</span>
                <p className="mx-auto mt-2 max-w-2xl text-xl font-medium leading-relaxed text-white">
                  Every student deserves a safe space to speak. SafeVoice bridges the gap
                  between silence and the support that can change a life.
                </p>
                <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-[#a38016]">
                  ~~ The SafeVoice Mission ~~
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── THREE ROLES ───────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-12 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[#a38016]">Who it&apos;s for</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0d0d0d] sm:text-4xl">
              Built for every role in your institution
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {[
              { image: IMAGES.community, icon: Heart, color: "bg-blue-600", role: "Students", desc: "A safe, always-available space to express what you're going through without fear.", points: ["Anonymous AI wellbeing assistant", "Report incidents anonymously", "Mood tracking & insights", "Access support resources"], cta: "Student sign up", href: "/register" },
              { image: IMAGES.support, icon: Users, color: "bg-[#193852]", role: "Faculty", desc: "Structured visibility into student concerns — without compromising anonymity.", points: ["Risk-sorted alert inbox", "Anonymous case management", "Identity reveal workflow", "Pattern detection"], cta: "Faculty register", href: "/faculty-register", featured: true },
              { image: IMAGES.campus, icon: TrendingUp, color: "bg-[#a38016]", role: "Administrators", desc: "Institution-level safeguarding insights and reporting at your fingertips.", points: ["Safeguarding analytics", "Faculty management", "Anonymised report exports", "Platform-wide settings"], cta: "Admin sign in", href: "/login" },
            ].map((r) => (
              <div key={r.role} className={`overflow-hidden rounded-2xl border transition-shadow hover:shadow-lg ${r.featured ? "border-[#193852]/20 bg-[#193852]/5" : "border-gray-100 bg-white"}`}>
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={r.image}
                    alt={`${r.role} portal`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className={`absolute bottom-4 left-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${r.color}`}>
                    <r.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="p-7">
                  <h3 className="text-lg font-extrabold text-[#0d0d0d]">{r.role}</h3>
                  <p className="mt-2 text-sm text-gray-500">{r.desc}</p>
                  <ul className="mt-5 space-y-2.5">
                    {r.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-[#0d0d0d]">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#a38016]" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={r.href}
                    className={`mt-7 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all ${r.featured ? "bg-[#193852] text-white hover:bg-[#193852]/90" : "border border-gray-200 text-[#0d0d0d] hover:border-gray-300 hover:bg-gray-50"}`}
                  >
                    {r.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────── */}
        <section className="bg-[#f7f6f3] py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-14 text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-[#a38016]">How it works</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0d0d0d] sm:text-4xl">
                From conversation to resolution
              </h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { n: "01", icon: MessageCircle, title: "Student talks to AI", desc: "In a private, anonymous conversation about anything on their mind." },
                { n: "02", icon: AlertTriangle, title: "Risk is detected", desc: "The AI silently assesses the conversation and flags concerns when needed." },
                { n: "03", icon: Eye, title: "Faculty is notified", desc: "An anonymised structured incident report appears in the faculty inbox." },
                { n: "04", icon: CheckCircle2, title: "Support is given", desc: "Faculty respond, manage the case, and student gets help — safely." },
              ].map((s) => (
                <div key={s.n} className="rounded-2xl bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-2xl font-black text-[#a38016]">{s.n}</span>
                    <s.icon className="h-4 w-4 text-gray-400" />
                  </div>
                  <h3 className="font-bold text-[#0d0d0d]">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────── */}
        <section className="mx-6 my-16 overflow-hidden rounded-3xl sm:mx-10 lg:mx-16">
          <div className="relative px-6 py-20 text-center">
            <Image
              src={IMAGES.hero}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              aria-hidden
            />
            <div className="absolute inset-0 bg-[#193852]/90" />

            <div className="relative mx-auto max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-widest text-[#a38016]">Get started today</p>
              <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
                Ready to give your students a voice?
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/70">
                Join institutions that trust SafeVoice to protect students, support wellbeing,
                and provide early safeguarding insights.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Link href="/register" className="flex items-center gap-2 rounded-full bg-[#a38016] px-8 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90">
                  Sign up as Student
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/faculty-register" className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20">
                  Faculty Registration
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#193852]">
              <Shield className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-[#0d0d0d]">SafeVoice</span>
          </Link>
          <p className="text-xs text-gray-400">
            Built for student safety. Fully anonymous. Clinically informed.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/login" className="hover:text-[#0d0d0d]">Sign in</Link>
            <Link href="/register" className="hover:text-[#0d0d0d]">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
