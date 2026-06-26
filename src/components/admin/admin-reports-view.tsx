"use client";

import { ReportsPanel } from "@/components/admin/reports-panel";
import { useLanguage } from "@/components/providers/language-provider";

export function AdminReportsView() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("admin.reports.pageTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.reports.pageSubtitle")}</p>
      </div>
      <ReportsPanel />
    </div>
  );
}
