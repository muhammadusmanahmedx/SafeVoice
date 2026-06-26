"use client";

import Link from "next/link";
import { FacultyCaseDetail } from "@/components/faculty/case-detail";
import { useLanguage } from "@/components/providers/language-provider";
import type { CaseStatus } from "@/types";

interface FacultyCaseDetailViewProps {
  notFound?: boolean;
  caseData?: {
    id: string;
    institution_id: string;
    conversation_id: string | null;
    incident_type: string;
    severity: string;
    summary: string;
    location: string | null;
    duration: string | null;
    people_involved: string | null;
    others_affected: boolean | null;
    status: CaseStatus;
    recommended_action: string | null;
    identity_revealed: boolean;
    auto_alerted: boolean;
    created_at: string;
    updated_at: string;
  } | null;
  messages?: { id: string; sender_role: string; content: string; created_at: string }[];
  notes?: { id: string; content: string; created_at: string }[];
  studentInfo?: { display_name: string | null; avatar_url: string | null } | null;
  revealRequests?: Array<{ id: string; status: "pending" | "accepted" | "declined"; created_at: string; responded_at: string | null }>;
}

export function FacultyCaseDetailView({
  notFound,
  caseData,
  messages = [],
  notes = [],
  studentInfo,
  revealRequests = [],
}: FacultyCaseDetailViewProps) {
  const { t } = useLanguage();

  if (notFound || !caseData) {
    return <p className="p-6 text-sm text-muted-foreground">{t("common.notFound")}</p>;
  }

  return (
    <div className="space-y-4">
      <Link href="/faculty/cases" className="text-sm text-primary hover:underline">
        {t("common.backToCases")}
      </Link>
      <FacultyCaseDetail
        caseData={caseData}
        messages={messages}
        notes={notes}
        studentInfo={studentInfo}
        revealRequests={revealRequests}
      />
    </div>
  );
}
