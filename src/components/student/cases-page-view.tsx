"use client";

import Link from "next/link";
import { StudentCaseDetail } from "@/components/student/case-detail";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/providers/language-provider";
import { getCaseStatusLabel, getIncidentTypeLabel, getRiskLevelLabel } from "@/lib/i18n/labels";
import type { CaseStatus } from "@/types";
import { RISK_LEVEL_COLORS } from "@/types";
import { cn } from "@/lib/utils";

interface CaseData {
  id: string;
  status: CaseStatus;
  summary: string;
  severity: string;
  incident_type: string;
  location: string | null;
  created_at: string;
}

interface CaseMessage {
  id: string;
  sender_role: string;
  content: string;
  created_at: string;
}

interface CasesListViewProps {
  cases: CaseData[];
}

export function CasesListView({ cases }: CasesListViewProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("student.cases.pageTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("student.cases.pageSubtitle")}</p>
      </div>

      <div className="space-y-3">
        {cases.length > 0 ? (
          cases.map((c) => (
            <Link key={c.id} href={`/cases?id=${c.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium capitalize">{getIncidentTypeLabel(t, c.incident_type)}</p>
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{c.summary}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <Badge variant="outline">{getCaseStatusLabel(t, c.status)}</Badge>
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-xs capitalize",
                          RISK_LEVEL_COLORS[c.severity as keyof typeof RISK_LEVEL_COLORS]
                        )}
                      >
                        {getRiskLevelLabel(t, c.severity)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">{t("student.cases.empty")}</p>
        )}
      </div>
    </div>
  );
}

interface CaseDetailPageViewProps {
  caseData: CaseData;
  messages: CaseMessage[];
  revealRequest?: { id: string; status: string } | null;
}

export function CaseDetailPageView({ caseData, messages, revealRequest }: CaseDetailPageViewProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <Link href="/cases" className="text-sm text-primary hover:underline">
        {t("common.backToCases")}
      </Link>
      <StudentCaseDetail
        caseData={caseData}
        messages={messages}
        revealRequest={revealRequest}
      />
    </div>
  );
}

interface CaseNotFoundViewProps {
  message?: string;
}

export function CaseNotFoundView({ message }: CaseNotFoundViewProps) {
  const { t } = useLanguage();

  return <p>{message ?? t("student.cases.notFound")}</p>;
}
