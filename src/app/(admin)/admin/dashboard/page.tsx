import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { AdminCharts } from "@/components/admin/admin-charts";
import { format, subDays, startOfWeek } from "date-fns";
import Link from "next/link";
import { Users, Shield, FolderOpen, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const openCases     = allCases.filter((c) => c.status === "new" || c.status === "in_progress").length;
  const resolvedCases = allCases.filter((c) => c.status === "resolved").length;
  const highRisk      = allCases.filter((c) => c.severity === "high" || c.severity === "critical").length;

  const riskCounts = { low: 0, medium: 0, high: 0, critical: 0 };
  for (const r of riskAssessments ?? []) riskCounts[r.risk_level as keyof typeof riskCounts]++;
  const riskDistribution = Object.entries(riskCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), value,
  }));

  const categoryMap = new Map<string, number>();
  for (const c of allCases) categoryMap.set(c.incident_type, (categoryMap.get(c.incident_type) ?? 0) + 1);
  const topCategories = Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name: name.replace("_", " "), count }))
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

  const stats = [
    { label: "Total Students",  value: studentCount ?? 0,  sub: "Enrolled",          icon: Users,        iconBg: "bg-blue-50",   iconColor: "text-blue-600",   href: "/admin/faculty" },
    { label: "Total Faculty",   value: facultyCount ?? 0,  sub: "Active staff",      icon: Shield,       iconBg: "bg-[#193852]/10", iconColor: "text-[#193852]", href: "/admin/faculty" },
    { label: "Open Cases",      value: openCases,          sub: "Needs attention",   icon: FolderOpen,   iconBg: "bg-amber-50",  iconColor: "text-amber-600",  href: "/admin/reports" },
    { label: "Resolved Cases",  value: resolvedCases,      sub: "Closed successfully", icon: CheckCircle2, iconBg: "bg-green-50",  iconColor: "text-green-600",  href: "/admin/reports" },
    { label: "High Risk",       value: highRisk,           sub: "Urgent review",     icon: AlertTriangle, iconBg: "bg-red-50",   iconColor: "text-red-600",    href: "/admin/reports" },
    { label: "Total Cases",     value: allCases.length,    sub: "All time",          icon: TrendingUp,   iconBg: "bg-violet-50", iconColor: "text-violet-600", href: "/admin/reports" },
  ];

  return (
    <div className="space-y-7 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#193852]">Admin Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {profile.institutions?.name ?? "Institution"} — safeguarding analytics
          </p>
        </div>
        <Link href="/admin/reports"
          className="hidden items-center gap-2 rounded-xl bg-[#193852] px-4 py-2 text-sm font-bold text-white hover:bg-[#193852]/90 sm:flex"
        >
          <TrendingUp className="h-4 w-4" /> View Reports
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}
            className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{s.label}</p>
                <p className="mt-2 text-3xl font-extrabold text-[#193852]">{s.value}</p>
                <p className="mt-1 text-xs text-gray-400">{s.sub}</p>
              </div>
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", s.iconBg)}>
                <s.icon className={cn("h-5 w-5", s.iconColor)} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <AdminCharts
        riskDistribution={riskDistribution}
        topCategories={topCategories}
        topLocations={topLocations}
        weeklyActivity={weeklyActivity}
        moodTrend={moodTrend}
      />
    </div>
  );
}
