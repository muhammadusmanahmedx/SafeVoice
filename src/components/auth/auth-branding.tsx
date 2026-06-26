"use client";

import Link from "next/link";
import {
  Shield,
  CheckCircle2,
  Lock,
  Heart,
  Smile,
  Bell,
  FileText,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

type AuthBrandingVariant = "login" | "register" | "faculty";

interface AuthBrandingProps {
  variant?: AuthBrandingVariant;
}

function BrandingShell({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();

  return (
    <div className="relative flex h-full flex-col justify-between p-12">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-bold text-white">SafeVoice</span>
      </Link>

      {children}

      <p className="text-xs text-white/40">
        © {new Date().getFullYear()} SafeVoice. {t("auth.rightsReserved")}
      </p>
    </div>
  );
}

function FeatureRow({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-white/70">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
        <Icon className="h-3.5 w-3.5 text-[#a38016]" />
      </div>
      {text}
    </div>
  );
}

function LoginBranding() {
  const { t } = useLanguage();

  const features = [
    t("auth.featureAnonymous"),
    t("auth.featureSupport"),
    t("auth.featureFaculty"),
    t("auth.featureEvidence"),
  ];

  return (
    <BrandingShell>
      <div className="space-y-5">
        <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#a38016]">
          {t("auth.studentWellbeing")}
        </span>
        <blockquote className="text-3xl font-extrabold leading-snug tracking-tight text-white">
          &ldquo;{t("auth.safeSpaceQuote")}&rdquo;
        </blockquote>
        <p className="text-sm leading-relaxed text-white/65">{t("auth.platformTagline")}</p>
        <div className="grid grid-cols-2 gap-3 pt-2">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm text-white/70">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#a38016]" />
              {feature}
            </div>
          ))}
        </div>
      </div>
    </BrandingShell>
  );
}

function RegisterBranding() {
  const { t } = useLanguage();

  const features = [
    { icon: Lock, text: t("auth.registerPanel.featureAnonymousDefault") },
    { icon: Heart, text: t("auth.registerPanel.featureSupport247") },
    { icon: Smile, text: t("auth.registerPanel.featureMoodTracking") },
  ];

  return (
    <BrandingShell>
      <div className="space-y-6">
        <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#a38016]">
          {t("auth.registerPanel.badge")}
        </span>
        <h2 className="text-3xl font-extrabold leading-snug tracking-tight text-white">
          {t("auth.registerPanel.headline")}{" "}
          <span className="text-white/60">{t("auth.registerPanel.headlineAccent")}</span>
        </h2>
        <p className="text-sm leading-relaxed text-white/65">{t("auth.registerPanel.description")}</p>
        <div className="space-y-3 pt-2">
          {features.map(({ icon, text }) => (
            <FeatureRow key={text} icon={icon} text={text} />
          ))}
        </div>
      </div>
    </BrandingShell>
  );
}

function FacultyBranding() {
  const { t } = useLanguage();

  const features = [
    { icon: Bell, text: t("auth.facultyRegister.panelFeatureAlerts") },
    { icon: FileText, text: t("auth.facultyRegister.panelFeatureCases") },
    { icon: Users, text: t("auth.facultyRegister.panelFeaturePatterns") },
  ];

  return (
    <BrandingShell>
      <div className="space-y-6">
        <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#a38016]">
          {t("auth.facultyRegister.panelBadge")}
        </span>
        <h2 className="text-3xl font-extrabold leading-snug tracking-tight text-white">
          {t("auth.facultyRegister.panelHeadline")}{" "}
          <span className="text-white/60">{t("auth.facultyRegister.panelHeadlineAccent")}</span>
        </h2>
        <p className="text-sm leading-relaxed text-white/65">
          {t("auth.facultyRegister.panelDescription")}
        </p>
        <div className="space-y-3 pt-2">
          {features.map(({ icon, text }) => (
            <FeatureRow key={text} icon={icon} text={text} />
          ))}
        </div>
      </div>
    </BrandingShell>
  );
}

export function AuthBranding({ variant = "login" }: AuthBrandingProps) {
  if (variant === "register") return <RegisterBranding />;
  if (variant === "faculty") return <FacultyBranding />;
  return <LoginBranding />;
}
