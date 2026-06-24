import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { CASE_STATUS_LABELS, RISK_LEVEL_COLORS } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { FacultyCharts } from "@/components/faculty/faculty-charts";
import {
  AlertTriangle, FolderOpen, CheckCircle2, TrendingUp,
  Clock, ArrowRight, Bell, Users,
} from "lucide-react";

export default async function FacultyDashboard() {
  const profile = await requireProfile(["faculty", "admin"]);
  const supabase = await createClient();

  const { data: cases } = await supabase
    .from("anonymous_cases" as "cases")
    .select("*")
    .eq("institution_id", profile.institution_id)
    .order("created_at", { ascending: false });

  const allCases = cases ?? [];
  const openCases    = allCases.filter((c) => c.status === "new");
  const activeCases  = allCases.filter((c) => c.status === "in_progress" || c.status === "escalated");
  const resolvedCases = allCases.filter((c) => c.status === "resolved");
  const highRiskCases = allCases.filter((c) => c.severity === "high" || c.severity === "critical");

  // Chart data — severity distribution
  const severityData = [
    { name: "Low",      value: allCases.filter(c => c.severity === "low").length,      color: "#22c55e" },
    { name: "Medium",   value: allCases.filter(c => c.severity === "medium").length,   color: "#f59e0b" },
    { name: "High",     value: allCases.filter(c => c.severity === "high").length,     color: "#f97316" },
    { name: "Critical", value: allCases.filter(c => c.severity === "critical").length, color: "#ef4444" },
  ];

  // Weekly case trend (last 7 days)
  const { format, subDays } = await import("date-fns");
  const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const count = allCases.filter(
      (c) => format(new Date(c.created_at), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    ).length;
    return { day: format(date, "EEE"), count };
  });

  // Incident type breakdown
  const typeMap = new Map<string, number>();
  for (const c of allCases) {
    typeMap.set(c.incident_type, (typeMap.get(c.incident_type) ?? 0) + 1);
  }
  const typeBreakdown = Array.from(typeMap.entries())
    .map(([name, count]) => ({ name: name.replace(/_/g, " "), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const stats = [
    { label: "Open Cases",    value: openCases.length,    sub: "Awaiting review",     icon: Bell,         iconBg: "bg-blue-50",   iconColor: "text-blue-600",   href: "/faculty/alerts" },
    { label: "In Progress",   value: activeCases.length,  sub: "Being managed",       icon: Clock,        iconBg: "bg-amber-50",  iconColor: "text-amber-600",  href: "/faculty/cases" },
    { label: "Resolved",      value: resolvedCases.length, sub: "Successfully closed", icon: CheckCircle2, iconBg: "bg-green-50",  iconColor: "text-green-600",  href: "/faculty/cases" },
    { label: "High Risk",     value: highRiskCases.length, sub: "Needs urgent review",  icon: AlertTriangle, iconBg: "bg-red-50",   iconColor: "text-red-600",    href: "/faculty/alerts" },
  ];

  return (
    <div className="space-y-7 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#193852]">Faculty Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">Anonymous student safeguarding overview</p>
        </div>
        <Link href="/faculty/alerts"
          className="hidden items-center gap-2 rounded-xl bg-[#193852] px-4 py-2 text-sm font-bold text-white hover:bg-[#193852]/90 sm:flex"
        >
          <Bell className="h-4 w-4" /> Review Alerts
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      {/* Charts row */}
      <FacultyCharts
        severityData={severityData}
        weeklyTrend={weeklyTrend}
        typeBreakdown={typeBreakdown}
      />

      {/* Recent high-risk alerts table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#193852]">
              High Priority Alerts
            </h2>
          </div>
          <Link href="/faculty/alerts" className="text-xs font-semibold text-[#a38016] hover:underline">
            View all <ArrowRight className="inline h-3 w-3" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {highRiskCases.slice(0, 5).map((c) => (
            <Link key={c.id} href={`/faculty/cases/${c.id}`}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50"
            >
              <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                c.severity === "critical" ? "bg-red-50" : "bg-orange-50")}>
                <AlertTriangle className={cn("h-4 w-4",
                  c.severity === "critical" ? "text-red-600" : "text-orange-500")} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold capitalize text-[#193852]">
                  {c.incident_type?.replace(/_/g, " ")}
                </p>
                <p className="mt-0.5 truncate text-xs text-gray-400">{c.summary}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  c.severity === "critical" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700")}>
                  {c.severity}
                </span>
                <p className="text-[10px] text-gray-400">{formatDate(c.created_at)}</p>
              </div>
            </Link>
          ))}
          {highRiskCases.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <CheckCircle2 className="mb-2 h-10 w-10 text-green-400" />
              <p className="text-sm font-semibold text-gray-600">No high-risk alerts</p>
              <p className="mt-1 text-xs text-gray-400">All clear — no urgent cases at this time</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
