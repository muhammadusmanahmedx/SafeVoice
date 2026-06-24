"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from "recharts";

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
  riskDistribution: { name: string; value: number }[];
  topCategories: { name: string; count: number }[];
  topLocations: { name: string; count: number }[];
  weeklyActivity: { date: string; count: number }[];
  moodTrend: { week: string; avgMood: number }[];
}

const ChartCard = ({ title, sub, children, className }: { title: string; sub?: string; children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm${className ? ` ${className}` : ""}`}>
    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{sub ?? "Analytics"}</p>
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
          <p key={i} className="text-gray-500">{p.name ?? "Value"}: <strong>{p.value}</strong></p>
        ))}
      </div>
    );
  }
  return null;
};

export function AdminCharts({ riskDistribution, topCategories, topLocations, weeklyActivity, moodTrend }: AdminChartsProps) {
  return (
    <div className="space-y-5">
      {/* Top row: weekly area + risk donut */}
      <div className="grid gap-5 lg:grid-cols-3">
        <ChartCard title="Weekly Activity Trend" sub="Case Volume" className="lg:col-span-2">
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
              <Area type="monotone" dataKey="count" stroke={PALETTE.navy} strokeWidth={2.5} fill="url(#areaGrad)" name="Cases" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Risk Distribution" sub="Severity Breakdown">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={riskDistribution} dataKey="value" cx="50%" cy="50%" innerRadius={48} outerRadius={70} paddingAngle={3}>
                {riskDistribution.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v} assessments`, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {riskDistribution.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
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

      {/* Bottom row: categories bar + locations bar + mood line */}
      <div className="grid gap-5 lg:grid-cols-3">
        <ChartCard title="Most Common Issues" sub="Incident Types">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topCategories} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
              <Bar dataKey="count" fill={PALETTE.navy} radius={[6, 6, 0, 0]} name="Cases" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Most Reported Locations" sub="Location Data">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topLocations} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#374151", fontSize: 11 }} width={80} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
              <Bar dataKey="count" fill={PALETTE.gold} radius={[0, 6, 6, 0]} name="Reports" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Mood Trends (Anonymized)" sub="Wellbeing">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={moodTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 10 }} />
              <YAxis domain={[1, 5]} reversed axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="avgMood" stroke={PALETTE.teal} strokeWidth={2.5} dot={{ r: 3, fill: PALETTE.teal }} name="Avg Mood" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
