"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

interface FacultyChartsProps {
  severityData: { name: string; value: number; color: string }[];
  weeklyTrend: { day: string; count: number }[];
  typeBreakdown: { name: string; count: number }[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold text-[#193852]">{label}</p>
        <p className="text-gray-500">{payload[0].value} case{payload[0].value !== 1 ? "s" : ""}</p>
      </div>
    );
  }
  return null;
};

export function FacultyCharts({ severityData, weeklyTrend, typeBreakdown }: FacultyChartsProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {/* Weekly trend */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">Weekly Activity</p>
        <p className="text-sm font-extrabold text-[#193852]">Cases Reported — Last 7 Days</p>
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyTrend} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {weeklyTrend.map((_, i) => (
                  <Cell key={i} fill={i === weeklyTrend.length - 1 ? "#193852" : "#193852"} opacity={0.15 + (i / weeklyTrend.length) * 0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Severity donut */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">Risk Breakdown</p>
        <p className="text-sm font-extrabold text-[#193852]">Severity Distribution</p>
        <div className="mt-2">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={severityData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                {severityData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(val, name) => [`${val} cases`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 space-y-1.5">
          {severityData.map((s) => (
            <div key={s.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-gray-600">{s.name}</span>
              </div>
              <span className="font-bold text-[#193852]">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Incident types */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-3">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">Incident Types</p>
        <p className="text-sm font-extrabold text-[#193852]">Most Common Issue Categories</p>
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={typeBreakdown} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#374151", fontSize: 11 }} width={100} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
              <Bar dataKey="count" fill="#193852" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
