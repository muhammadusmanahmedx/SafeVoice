import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { CounselorCaseDetailView } from "@/components/counselor/counselor-case-detail-view";
import type { CaseStatus } from "@/types";

export default async function FacultyCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireProfile(["counselor", "admin"]);
  const { id } = await params;
  const supabase = await createClient();

  const { data: caseData } = await supabase
    .from("cases")
    .select("*")
    .eq("id", id)
    .eq("institution_id", profile.institution_id)
    .single();

  if (!caseData) {
    return <CounselorCaseDetailView notFound />;
  }

  let studentInfo: { display_name: string | null; avatar_url: string | null } | null = null;
  if (caseData.identity_revealed) {
    const { data: student } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", caseData.student_id)
      .single();
    if (student) studentInfo = student;
  }

  const [{ data: messages }, { data: notes }, { data: revealRequests }] = await Promise.all([
    supabase
      .from("case_messages")
      .select("*")
      .eq("case_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("case_notes")
      .select("id, content, created_at")
      .eq("case_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("identity_reveal_requests")
      .select("id, status, created_at, responded_at")
      .eq("case_id", id)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  return (
    <CounselorCaseDetailView
      caseData={{
        id: caseData.id,
        institution_id: caseData.institution_id,
        conversation_id: caseData.conversation_id,
        incident_type: caseData.incident_type,
        severity: caseData.severity,
        summary: caseData.summary,
        location: caseData.location,
        duration: caseData.duration,
        people_involved: caseData.people_involved,
        others_affected: caseData.others_affected,
        status: caseData.status as CaseStatus,
        recommended_action: caseData.recommended_action,
        identity_revealed: caseData.identity_revealed,
        auto_alerted: caseData.auto_alerted,
        created_at: caseData.created_at,
        updated_at: caseData.updated_at,
      }}
      messages={messages ?? []}
      notes={notes ?? []}
      studentInfo={studentInfo}
      revealRequests={(revealRequests as Array<{ id: string; status: "pending" | "accepted" | "declined"; created_at: string; responded_at: string | null }>) ?? []}
    />
  );
}
