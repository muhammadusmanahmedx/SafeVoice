import Link from "next/link";
import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { FacultyCaseDetail } from "@/components/faculty/case-detail";

export default async function FacultyCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireProfile(["faculty", "admin"]);
  const { id } = await params;
  const supabase = await createClient();

  const { data: caseData } = await supabase
    .from("anonymous_cases" as "cases")
    .select("*")
    .eq("id", id)
    .eq("institution_id", profile.institution_id)
    .single();

  if (!caseData) {
    return <p className="p-6 text-sm text-muted-foreground">Case not found</p>;
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
    <div className="space-y-4">
      <Link href="/faculty/cases" className="text-sm text-primary hover:underline">
        ← Back to cases
      </Link>
      <FacultyCaseDetail
        caseData={caseData}
        messages={messages ?? []}
        notes={notes ?? []}
        revealRequests={(revealRequests as Array<{ id: string; status: "pending" | "accepted" | "declined"; created_at: string; responded_at: string | null }>) ?? []}
      />
    </div>
  );
}
