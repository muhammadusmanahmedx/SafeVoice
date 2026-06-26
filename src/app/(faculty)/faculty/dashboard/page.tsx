import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { FacultyDashboardView } from "@/components/faculty/faculty-dashboard-view";
import { format, subDays } from "date-fns";

export default async function FacultyDashboard() {
  const profile = await requireProfile(["faculty", "admin"]);
  const supabase = await createClient();

  const { data: cases } = await supabase
    .from("anonymous_cases" as "cases")
    .select("*")
    .eq("institution_id", profile.institution_id)
    .order("created_at", { ascending: false });

  const allCases = cases ?? [];
  const openCases = allCases.filter((c) => c.status === "new");
  const activeCases = allCases.filter((c) => c.status === "in_progress" || c.status === "escalated");
  const resolvedCases = allCases.filter((c) => c.status === "resolved");
  const highRiskCases = allCases.filter((c) => c.severity === "high" || c.severity === "critical");

  const severityData = [
    { key: "low", value: allCases.filter((c) => c.severity === "low").length, color: "#22c55e" },
    { key: "medium", value: allCases.filter((c) => c.severity === "medium").length, color: "#f59e0b" },
    { key: "high", value: allCases.filter((c) => c.severity === "high").length, color: "#f97316" },
    { key: "critical", value: allCases.filter((c) => c.severity === "critical").length, color: "#ef4444" },
  ];

  const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const count = allCases.filter(
      (c) => format(new Date(c.created_at), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    ).length;
    return { day: format(date, "EEE"), count };
  });

  const typeMap = new Map<string, number>();
  for (const c of allCases) {
    typeMap.set(c.incident_type, (typeMap.get(c.incident_type) ?? 0) + 1);
  }
  const typeBreakdown = Array.from(typeMap.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <FacultyDashboardView
      openCases={openCases.length}
      activeCases={activeCases.length}
      resolvedCases={resolvedCases.length}
      highRiskCount={highRiskCases.length}
      severityData={severityData}
      weeklyTrend={weeklyTrend}
      typeBreakdown={typeBreakdown}
      highRiskCases={highRiskCases.map((c) => ({
        id: c.id,
        incident_type: c.incident_type,
        summary: c.summary,
        severity: c.severity,
        created_at: c.created_at,
      }))}
    />
  );
}
