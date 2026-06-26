"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/providers/language-provider";
import { getCaseStatusLabel, getIncidentTypeLabel, getRiskLevelLabel } from "@/lib/i18n/labels";
import { RISK_LEVEL_COLORS } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import type { CaseStatus } from "@/types";

interface CounselorAlertsViewProps {
  cases: {
    id: string;
    status: CaseStatus;
    incident_type: string;
    summary: string;
    severity: string;
    created_at: string;
    auto_alerted?: boolean;
  }[];
}

export function CounselorAlertsView({ cases }: CounselorAlertsViewProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("counselor.alerts.pageTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("counselor.alerts.pageSubtitle")}</p>
      </div>

      <div className="space-y-3">
        {cases.map((c) => (
          <Link key={c.id} href={`/counselor/cases/${c.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{getCaseStatusLabel(t, c.status)}</Badge>
                      {c.auto_alerted && (
                        <Badge variant="secondary" className="text-amber-700 bg-amber-500/10">
                          {t("counselor.alerts.autoAlert")}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {getIncidentTypeLabel(t, c.incident_type)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">{c.summary}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(c.created_at)}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1 text-xs font-medium",
                      RISK_LEVEL_COLORS[c.severity as keyof typeof RISK_LEVEL_COLORS]
                    )}
                  >
                    {getRiskLevelLabel(t, c.severity)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {cases.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("counselor.alerts.empty")}</p>
        )}
      </div>
    </div>
  );
}
