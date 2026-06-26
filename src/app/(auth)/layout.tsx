import { LanguageToggle } from "@/components/layout/language-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh pt-safe">
      <div className="absolute end-4 top-[max(1rem,calc(env(safe-area-inset-top)+0.5rem))] z-50 sm:end-6">
        <LanguageToggle />
      </div>
      {children}
    </div>
  );
}
