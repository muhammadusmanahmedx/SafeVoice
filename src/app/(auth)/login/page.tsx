import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Shield, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left panel — image + brand */}
      <div className="relative hidden w-[52%] overflow-hidden lg:block">
        <Image
          src="/images/community.jpg"
          alt="Students supporting each other"
          fill
          className="object-cover"
          priority
          sizes="52vw"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-[#193852]/82" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* Content */}
        <div className="relative flex h-full flex-col justify-between p-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">SafeVoice</span>
          </Link>

          {/* Quote */}
          <div className="space-y-5">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#a38016]">
              Student Wellbeing Platform
            </span>
            <blockquote className="text-3xl font-extrabold leading-snug tracking-tight text-white">
              &ldquo;A safe space to seek support — without fear of judgment.&rdquo;
            </blockquote>
            <p className="text-sm leading-relaxed text-white/65">
              Giving students a voice before silence becomes a crisis.
              24/7 anonymous support powered by AI.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {["Anonymous by design", "24/7 AI support", "Faculty connected", "Evidence-based"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-white/70">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#a38016]" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} SafeVoice. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#193852]">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-[#193852]">SafeVoice</span>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
