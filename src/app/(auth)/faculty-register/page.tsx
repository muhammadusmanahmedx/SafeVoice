import Image from "next/image";
import Link from "next/link";
import { FacultyRegisterForm } from "@/components/auth/faculty-register-form";
import { Shield, Users, FileText, Bell } from "lucide-react";

export default function FacultyRegisterPage() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left panel */}
      <div className="relative hidden w-[52%] overflow-hidden lg:block">
        <Image
          src="/images/support.jpg"
          alt="Faculty supporting students"
          fill
          className="object-cover"
          priority
          sizes="52vw"
        />
        <div className="absolute inset-0 bg-[#193852]/82" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 border border-white/20">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">SafeVoice</span>
          </Link>

          <div className="space-y-6">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#a38016]">
              Faculty Portal
            </span>
            <h2 className="text-3xl font-extrabold leading-snug tracking-tight text-white">
              Protect students. <span className="text-white/60">Make a difference.</span>
            </h2>
            <p className="text-sm leading-relaxed text-white/65">
              The faculty portal gives you structured visibility into student
              concerns while maintaining anonymity and trust.
            </p>
            <div className="space-y-3 pt-2">
              {[
                { icon: Bell, text: "Risk-sorted alerts in your inbox" },
                { icon: FileText, text: "Structured, anonymous case management" },
                { icon: Users, text: "Pattern detection across your institution" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-white/70">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-3.5 w-3.5 text-[#a38016]" />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} SafeVoice. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#193852]">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-[#193852]">SafeVoice</span>
          </div>
          <FacultyRegisterForm />
        </div>
      </div>
    </div>
  );
}
