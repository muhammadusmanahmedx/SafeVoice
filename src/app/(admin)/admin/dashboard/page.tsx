import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";
import { format, subDays, startOfWeek } from "date-fns";

export default async function AdminDashboard() {
  const profile = await requireProfile(["admin"]);
  const supabase = await createClient();
  const institutionId = profile.institution_id;

  const [
    { count: studentCount },
    { count: facultyCount },
    { data: cases },
    { data: riskAssessments },
    { data: moodLogs },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("institution_id", institutionId).eq("role", "student"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("institution_id", institutionId).eq("role", "faculty"),
    supabase.from("cases").select("status, severity, incident_type, location, created_at").eq("institution_id", institutionId),
    supabase.from("risk_assessments").select("risk_level, created_at").eq("institution_id", institutionId),
    supabase.from("mood_logs").select("mood, logged_at").eq("institution_id", institutionId),
  ]);

  const allCases = cases ?? [];
  const openCases = allCases.filter((c) => c.status === "new" || c.status === "in_progress").length;
  const resolvedCases = allCases.filter((c) => c.status === "resolved").length;
  const highRisk = allCases.filter((c) => c.severity === "high" || c.severity === "critical").length;

  const riskCounts = { low: 0, medium: 0, high: 0, critical: 0 };
  for (const r of riskAssessments ?? []) riskCounts[r.risk_level as keyof typeof riskCounts]++;
  const riskDistribution = Object.entries(riskCounts).map(([key, value]) => ({ key, value }));

  const categoryMap = new Map<string, number>();
  for (const c of allCases) categoryMap.set(c.incident_type, (categoryMap.get(c.incident_type) ?? 0) + 1);
  const topCategories = Array.from(categoryMap.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count).slice(0, 5);

  const locationMap = new Map<string, number>();
  for (const c of allCases) if (c.location) locationMap.set(c.location, (locationMap.get(c.location) ?? 0) + 1);
  const topLocations = Array.from(locationMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count).slice(0, 5);

  const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, "MMM d");
    const count = allCases.filter(
      (c) => format(new Date(c.created_at), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    ).length;
    return { date: dateStr, count };
  });

  const moodByWeek = new Map<string, { total: number; count: number }>();
  for (const m of moodLogs ?? []) {
    const week = format(startOfWeek(new Date(m.logged_at)), "MMM d");
    const e = moodByWeek.get(week) ?? { total: 0, count: 0 };
    e.total += m.mood; e.count++;
    moodByWeek.set(week, e);
  }
  const moodTrend = Array.from(moodByWeek.entries())
    .map(([week, { total, count }]) => ({ week, avgMood: Math.round((total / count) * 10) / 10 }))
    .slice(-8);

  return (
    <AdminDashboardView
      institutionName={profile.institutions?.name ?? "Institution"}
      studentCount={studentCount ?? 0}
      facultyCount={facultyCount ?? 0}
      openCases={openCases}
      resolvedCases={resolvedCases}
      highRisk={highRisk}
      totalCases={allCases.length}
      riskDistribution={riskDistribution}
      topCategories={topCategories}
      topLocations={topLocations}
      weeklyActivity={weeklyActivity}
      moodTrend={moodTrend}
    />
  );
}
