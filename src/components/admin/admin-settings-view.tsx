"use client";

import { SettingsForm } from "@/components/admin/settings-form";
import { useLanguage } from "@/components/providers/language-provider";

interface AdminSettingsViewProps {
  institutionName: string;
}

export function AdminSettingsView({ institutionName }: AdminSettingsViewProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("admin.settings.pageTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.settings.pageSubtitle")}</p>
      </div>
      <SettingsForm institutionName={institutionName} />
    </div>
  );
}
