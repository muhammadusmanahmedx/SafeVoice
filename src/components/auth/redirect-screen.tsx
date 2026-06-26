"use client";

import { Shield } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

export function RedirectScreen({ role }: { role: string }) {
  const { t } = useLanguage();

  const label =
    role === "admin"
      ? t("portal.admin")
      : role === "counselor"
        ? t("portal.counselor")
        : t("portal.student");

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg">
        <Shield className="h-6 w-6 text-white" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t("auth.redirectTakingYou")}</p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-primary"
            style={{ animation: `typing-bounce 1.2s ${i * 0.2}s infinite ease-in-out` }}
          />
        ))}
      </div>
    </div>
  );
}
