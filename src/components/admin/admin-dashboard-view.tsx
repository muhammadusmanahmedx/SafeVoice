"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { AdminCharts } from "@/components/admin/admin-charts";
import { useLanguage } from "@/components/providers/language-provider";
import { formatMessage } from "@/lib/i18n/labels";
import { Users, Shield, FolderOpen, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";

interface AdminDashboardViewProps {
  institutionName: string;
  studentCount: number;
  counselorCount: number;
  openCases: number;
  resolvedCases: number;
  highRisk: number;
  totalCases: number;
  riskDistribution: { key: string; value: number }[];
  topCategories: { type: string; count: number }[];
  topLocations: { name: string; count: number }[];
  weeklyActivity: { date: string; count: number }[];
  moodTrend: { week: string; avgMood: number }[];
}

export function AdminDashboardView({
  institutionName,
  studentCount,
  counselorCount,
  openCases,
  resolvedCases,
  highRisk,
  totalCases,
  riskDistribution,
  topCategories,
  topLocations,
  weeklyActivity,
  moodTrend,
}: AdminDashboardViewProps) {
  const { t } = useLanguage();

  const stats = [
    { labelKey: "admin.dashboard.stats.totalStudents", subKey: "admin.dashboard.stats.enrolled", value: studentCount, icon: Users, iconBg: "bg-blue-50", iconColor: "text-blue-600", href: "/admin/counselors" },
    { labelKey: "admin.dashboard.stats.totalCounselors", subKey: "admin.dashboard.stats.activeStaff", value: counselorCount, icon: Shield, iconBg: "bg-[#193852]/10", iconColor: "text-[#193852]", href: "/admin/counselors" },
    { labelKey: "admin.dashboard.stats.openCases", subKey: "admin.dashboard.stats.needsAttention", value: openCases, icon: FolderOpen, iconBg: "bg-amber-50", iconColor: "text-amber-600", href: "/admin/reports" },
    { labelKey: "admin.dashboard.stats.resolvedCases", subKey: "admin.dashboard.stats.closedSuccessfully", value: resolvedCases, icon: CheckCircle2, iconBg: "bg-green-50", iconColor: "text-green-600", href: "/admin/reports" },
    { labelKey: "admin.dashboard.stats.highRisk", subKey: "admin.dashboard.stats.urgentReview", value: highRisk, icon: AlertTriangle, iconBg: "bg-red-50", iconColor: "text-red-600", href: "/admin/reports" },
    { labelKey: "admin.dashboard.stats.totalCases", subKey: "admin.dashboard.stats.allTime", value: totalCases, icon: TrendingUp, iconBg: "bg-violet-50", iconColor: "text-violet-600", href: "/admin/reports" },
  ];

  return (
    <div className="space-y-7 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#193852]">{t("admin.dashboard.title")}</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {formatMessage(t("admin.dashboard.subtitle"), { institution: institutionName })}
          </p>
        </div>
        <Link href="/admin/reports"
          className="hidden items-center gap-2 rounded-xl bg-[#193852] px-4 py-2 text-sm font-bold text-white hover:bg-[#193852]/90 sm:flex"
        >
          <TrendingUp className="h-4 w-4" /> {t("admin.dashboard.viewReports")}
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.labelKey} href={s.href}
            className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{t(s.labelKey)}</p>
                <p className="mt-2 text-3xl font-extrabold text-[#193852]">{s.value}</p>
                <p className="mt-1 text-xs text-gray-400">{t(s.subKey)}</p>
              </div>
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", s.iconBg)}>
                <s.icon className={cn("h-5 w-5", s.iconColor)} />
              </div>
            </div>
          </Link>
        ))}
      </div>

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
