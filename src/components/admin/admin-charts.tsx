"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from "recharts";
import { useLanguage } from "@/components/providers/language-provider";
import { formatMessage, getIncidentTypeLabel, getRiskLevelLabel } from "@/lib/i18n/labels";

const PALETTE = {
  navy:  "#193852",
  gold:  "#a38016",
  teal:  "#0d9488",
  rose:  "#e11d48",
  amber: "#f59e0b",
  violet:"#7c3aed",
};

const PIE_COLORS = [PALETTE.teal, PALETTE.amber, PALETTE.rose, PALETTE.violet];

interface AdminChartsProps {
  riskDistribution: { key: string; value: number }[];
  topCategories: { type: string; count: number }[];
  topLocations: { name: string; count: number }[];
  weeklyActivity: { date: string; count: number }[];
  moodTrend: { week: string; avgMood: number }[];
}

export function AdminCharts({ riskDistribution, topCategories, topLocations, weeklyActivity, moodTrend }: AdminChartsProps) {
  const { t } = useLanguage();

  const chartRiskDistribution = riskDistribution.map((d) => ({
    ...d,
    name: getRiskLevelLabel(t, d.key),
  }));

  const chartTopCategories = topCategories.map((item) => ({
    name: getIncidentTypeLabel(t, item.type),
    count: item.count,
  }));

  const ChartCard = ({ title, sub, children, className }: { title: string; sub?: string; children: React.ReactNode; className?: string }) => (
    <div className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm${className ? ` ${className}` : ""}`}>
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{sub ?? t("admin.dashboard.charts.analytics")}</p>
      <p className="mt-0.5 text-sm font-extrabold text-[#193852]">{title}</p>
      <div className="mt-4">{children}</div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name?: string }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-lg text-xs">
          {label && <p className="font-semibold text-[#193852]">{label}</p>}
          {payload.map((p, i) => (
            <p key={i} className="text-gray-500">{p.name ?? t("admin.dashboard.charts.value")}: <strong>{p.value}</strong></p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-3">
        <ChartCard title={t("admin.dashboard.charts.weeklyActivityTrend")} sub={t("admin.dashboard.charts.caseVolume")} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyActivity}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PALETTE.navy} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={PALETTE.navy} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke={PALETTE.navy} strokeWidth={2.5} fill="url(#areaGrad)" name={t("admin.dashboard.charts.cases")} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t("admin.dashboard.charts.riskDistribution")} sub={t("admin.dashboard.charts.severityBreakdown")}>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={chartRiskDistribution} dataKey="value" cx="50%" cy="50%" innerRadius={48} outerRadius={70} paddingAngle={3}>
                {chartRiskDistribution.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [
                formatMessage(t("admin.dashboard.charts.assessments"), { count: Number(v) }),
                n,
              ]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {chartRiskDistribution.map((d, i) => (
              <div key={d.key} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-bold text-[#193852]">{d.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <ChartCard title={t("admin.dashboard.charts.mostCommonIssues")} sub={t("admin.dashboard.charts.incidentTypes")}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartTopCategories} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
              <Bar dataKey="count" fill={PALETTE.navy} radius={[6, 6, 0, 0]} name={t("admin.dashboard.charts.cases")} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t("admin.dashboard.charts.mostReportedLocations")} sub={t("admin.dashboard.charts.locationData")}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topLocations} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#374151", fontSize: 11 }} width={80} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
              <Bar dataKey="count" fill={PALETTE.gold} radius={[0, 6, 6, 0]} name={t("admin.dashboard.charts.reports")} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t("admin.dashboard.charts.moodTrends")} sub={t("admin.dashboard.charts.wellbeing")}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={moodTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 10 }} />
              <YAxis domain={[1, 5]} reversed axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="avgMood" stroke={PALETTE.teal} strokeWidth={2.5} dot={{ r: 3, fill: PALETTE.teal }} name={t("admin.dashboard.charts.avgMood")} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
