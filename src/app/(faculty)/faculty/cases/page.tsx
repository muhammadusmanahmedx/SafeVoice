import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { FacultyCasesView } from "@/components/faculty/faculty-cases-view";
import type { CaseStatus } from "@/types";

export default async function FacultyCasesPage() {
  const profile = await requireProfile(["faculty", "admin"]);
  const supabase = await createClient();

  const { data: cases } = await supabase
    .from("anonymous_cases" as "cases")
    .select("*")
    .eq("institution_id", profile.institution_id)
    .order("updated_at", { ascending: false });

  return (
    <FacultyCasesView
      cases={(cases ?? []).map((c) => ({
        id: c.id,
        status: c.status as CaseStatus,
        incident_type: c.incident_type,
        summary: c.summary,
        severity: c.severity,
        created_at: c.created_at,
        auto_alerted: (c as { auto_alerted?: boolean }).auto_alerted,
      }))}
    />
  );
}
