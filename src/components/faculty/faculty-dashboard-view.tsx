"use client";

import Link from "next/link";
import { cn, formatDate } from "@/lib/utils";
import { FacultyCharts } from "@/components/faculty/faculty-charts";
import { useLanguage } from "@/components/providers/language-provider";
import { getIncidentTypeLabel, getRiskLevelLabel } from "@/lib/i18n/labels";
import {
  AlertTriangle, CheckCircle2, Clock, ArrowRight, Bell,
} from "lucide-react";

interface FacultyDashboardViewProps {
  openCases: number;
  activeCases: number;
  resolvedCases: number;
  highRiskCount: number;
  severityData: { key: string; value: number; color: string }[];
  weeklyTrend: { day: string; count: number }[];
  typeBreakdown: { type: string; count: number }[];
  highRiskCases: {
    id: string;
    incident_type: string;
    summary: string;
    severity: string;
    created_at: string;
  }[];
}

export function FacultyDashboardView({
  openCases,
  activeCases,
  resolvedCases,
  highRiskCount,
  severityData,
  weeklyTrend,
  typeBreakdown,
  highRiskCases,
}: FacultyDashboardViewProps) {
  const { t } = useLanguage();

  const stats = [
    { labelKey: "faculty.dashboard.stats.openCases", subKey: "faculty.dashboard.stats.awaitingReview", value: openCases, icon: Bell, iconBg: "bg-blue-50", iconColor: "text-blue-600", href: "/faculty/alerts" },
    { labelKey: "faculty.dashboard.stats.inProgress", subKey: "faculty.dashboard.stats.beingManaged", value: activeCases, icon: Clock, iconBg: "bg-amber-50", iconColor: "text-amber-600", href: "/faculty/cases" },
    { labelKey: "faculty.dashboard.stats.resolved", subKey: "faculty.dashboard.stats.successfullyClosed", value: resolvedCases, icon: CheckCircle2, iconBg: "bg-green-50", iconColor: "text-green-600", href: "/faculty/cases" },
    { labelKey: "faculty.dashboard.stats.highRisk", subKey: "faculty.dashboard.stats.urgentReview", value: highRiskCount, icon: AlertTriangle, iconBg: "bg-red-50", iconColor: "text-red-600", href: "/faculty/alerts" },
  ];

  return (
    <div className="space-y-7 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#193852]">{t("faculty.dashboard.title")}</h1>
          <p className="mt-0.5 text-sm text-gray-500">{t("faculty.dashboard.subtitle")}</p>
        </div>
        <Link href="/faculty/alerts"
          className="hidden items-center gap-2 rounded-xl bg-[#193852] px-4 py-2 text-sm font-bold text-white hover:bg-[#193852]/90 sm:flex"
        >
          <Bell className="h-4 w-4" /> {t("faculty.dashboard.reviewAlerts")}
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <FacultyCharts
        severityData={severityData}
        weeklyTrend={weeklyTrend}
        typeBreakdown={typeBreakdown}
      />

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#193852]">
              {t("faculty.dashboard.highPriorityAlerts")}
            </h2>
          </div>
          <Link href="/faculty/alerts" className="text-xs font-semibold text-[#a38016] hover:underline">
            {t("common.viewAll")} <ArrowRight className="inline h-3 w-3" />
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
                <p className="text-sm font-semibold text-[#193852]">
                  {getIncidentTypeLabel(t, c.incident_type)}
                </p>
                <p className="mt-0.5 truncate text-xs text-gray-400">{c.summary}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  c.severity === "critical" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700")}>
                  {getRiskLevelLabel(t, c.severity)}
                </span>
                <p className="text-[10px] text-gray-400">{formatDate(c.created_at)}</p>
              </div>
            </Link>
          ))}
          {highRiskCases.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <CheckCircle2 className="mb-2 h-10 w-10 text-green-400" />
              <p className="text-sm font-semibold text-gray-600">{t("faculty.dashboard.noHighRiskTitle")}</p>
              <p className="mt-1 text-xs text-gray-400">{t("faculty.dashboard.noHighRiskDesc")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
