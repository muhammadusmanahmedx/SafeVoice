import { LanguageToggle } from "@/components/layout/language-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div className="absolute end-4 top-4 z-50 sm:end-6 sm:top-6">
        <LanguageToggle />
      </div>
      {children}
    </div>
  );
}
