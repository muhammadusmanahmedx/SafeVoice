import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import { AuthBranding } from "@/components/auth/auth-branding";
import { Shield } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-white">
      <div className="relative hidden w-[52%] overflow-hidden lg:block">
        <Image
          src="/images/community.jpg"
          alt="Students supporting each other"
          fill
          className="object-cover"
          priority
          sizes="52vw"
        />
        <div className="absolute inset-0 bg-[#193852]/82" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="relative h-full">
          <AuthBranding />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
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
