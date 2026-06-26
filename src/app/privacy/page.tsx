import Link from "next/link";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — SafeVoice",
  description: "How SafeVoice collects, uses, and protects student wellbeing data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#0d0d0d] antialiased">
      <header className="border-b border-gray-100 px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#193852]">
            <Shield className="h-4 w-4 text-white" />
          </span>
          SafeVoice
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: June 2026</p>

        <div className="prose prose-gray mt-8 max-w-none space-y-6 text-sm leading-relaxed text-gray-600">
          <section>
            <h2 className="text-lg font-bold text-[#0d0d0d]">Overview</h2>
            <p>
              SafeVoice is a student wellbeing and safeguarding platform used by schools and
              universities. We are committed to protecting privacy, especially for students who
              may use anonymous support features.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0d0d0d]">Information we collect</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Account information (email, display name, institution, role)</li>
              <li>Wellbeing conversations with our AI assistant and mood check-ins</li>
              <li>Counseling booking details and session metadata</li>
              <li>Safeguarding incident reports when students choose to escalate concerns</li>
              <li>Device timezone and language preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0d0d0d]">Camera and microphone</h2>
            <p>
              SafeVoice requests camera and microphone access only during in-app counseling video
              sessions (Jitsi Meet). We do not record or store video or audio on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0d0d0d]">How we use data</h2>
            <p>
              Data is used to provide wellbeing support, detect safeguarding risks, enable faculty
              follow-up when appropriate, and improve institution-level anonymised analytics. AI
              chat content is processed to generate responses and risk assessments.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0d0d0d]">Data sharing</h2>
            <p>
              Student identities remain anonymous to faculty unless a student explicitly chooses to
              reveal their identity during an escalation. We do not sell personal data. Data is
              stored in Supabase (PostgreSQL) with row-level security enforced per institution.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#0d0d0d]">Contact</h2>
            <p>
              For privacy questions, contact your institution administrator or the SafeVoice team
              through your institution&apos;s designated safeguarding lead.
            </p>
          </section>
        </div>

        <p className="mt-10">
          <Link href="/" className="text-sm font-semibold text-[#193852] hover:underline">
            ← Back to SafeVoice
          </Link>
        </p>
      </main>
    </div>
  );
}
