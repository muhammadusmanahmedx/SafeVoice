import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { CounselorAlertsView } from "@/components/counselor/counselor-alerts-view";
import type { CaseStatus } from "@/types";

export default async function AlertsPage() {
  const profile = await requireProfile(["counselor", "admin"]);
  const supabase = await createClient();

  const { data: cases } = await supabase
    .from("anonymous_cases" as "cases")
    .select("*")
    .eq("institution_id", profile.institution_id)
    .in("status", ["new", "escalated"])
    .order("created_at", { ascending: false });

  const sorted = (cases ?? []).sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return (
      (severityOrder[a.severity as keyof typeof severityOrder] ?? 4) -
      (severityOrder[b.severity as keyof typeof severityOrder] ?? 4)
    );
  });

  return (
    <CounselorAlertsView
      cases={sorted.map((c) => ({
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
