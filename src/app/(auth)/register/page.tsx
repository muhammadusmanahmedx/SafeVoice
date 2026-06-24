import Image from "next/image";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { getInstitutions } from "@/lib/auth/actions";
import { Shield, Heart, Smile, Lock } from "lucide-react";

export default async function RegisterPage() {
  const institutions = await getInstitutions();

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left panel — image + brand */}
      <div className="relative hidden w-[52%] overflow-hidden lg:block">
        <Image
          src="/images/mission.jpg"
          alt="Students studying together"
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
              Create your account
            </span>
            <h2 className="text-3xl font-extrabold leading-snug tracking-tight text-white">
              Your voice matters.{" "}
              <span className="text-white/60">We&apos;re here to listen.</span>
            </h2>
            <p className="text-sm leading-relaxed text-white/65">
              Join thousands of students who use SafeVoice to get support,
              track their wellbeing, and stay connected with their institution.
            </p>
            <div className="space-y-3 pt-2">
              {[
                { icon: Lock, text: "Your identity stays anonymous by default" },
                { icon: Heart, text: "24/7 AI support — always there when you need it" },
                { icon: Smile, text: "Track your mood and spot patterns over time" },
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

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#193852]">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-[#193852]">SafeVoice</span>
          </div>
          <RegisterForm institutions={institutions} />
        </div>
      </div>
    </div>
  );
}
