import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import {
  CaseDetailPageView,
  CaseNotFoundView,
  CasesListView,
} from "@/components/student/cases-page-view";
import type { CaseStatus } from "@/types";

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const profile = await requireProfile(["student"]);
  const { id } = await searchParams;
  const supabase = await createClient();

  const { data: cases } = await supabase
    .from("cases")
    .select("*")
    .eq("student_id", profile.id)
    .order("created_at", { ascending: false });

  if (id) {
    const caseData = cases?.find((c) => c.id === id);
    if (!caseData) {
      return <CaseNotFoundView />;
    }

    const [{ data: messages }, { data: revealRequests }] = await Promise.all([
      supabase
        .from("case_messages")
        .select("*")
        .eq("case_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("identity_reveal_requests")
        .select("*")
        .eq("case_id", id)
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

    return (
      <CaseDetailPageView
        caseData={caseData as {
          id: string;
          status: CaseStatus;
          summary: string;
          severity: string;
          incident_type: string;
          location: string | null;
          created_at: string;
        }}
        messages={messages ?? []}
        revealRequest={revealRequests?.[0]}
      />
    );
  }

  return (
    <CasesListView
      cases={(cases ?? []) as {
        id: string;
        status: CaseStatus;
        summary: string;
        severity: string;
        incident_type: string;
        location: string | null;
        created_at: string;
      }[]}
    />
  );
}
