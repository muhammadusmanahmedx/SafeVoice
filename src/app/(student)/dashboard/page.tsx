import Link from "next/link";
import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOOD_OPTIONS, CASE_STATUS_LABELS, RISK_LEVEL_COLORS } from "@/types";
import {
  MessageCircle, Smile, BookOpen, FolderOpen,
  ArrowRight, TrendingUp, Sparkles, TrendingDown, Minus,
  AlertTriangle, CheckCircle2, Clock, MoreHorizontal,
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

export default async function StudentDashboard() {
  const profile = await requireProfile(["student"]);
  const supabase = await createClient();

  const [{ data: moodLogs }, { data: conversations }, { data: cases }, { data: resources }] =
    await Promise.all([
      supabase.from("mood_logs").select("*").eq("student_id", profile.id).order("logged_at", { ascending: false }).limit(7),
      supabase.from("conversations").select("id, title, updated_at").eq("student_id", profile.id).order("updated_at", { ascending: false }).limit(3),
      supabase.from("cases").select("id, status, summary, created_at, severity, incident_type").eq("student_id", profile.id).neq("status", "resolved").limit(5),
      supabase.from("resources").select("id, title, category, type").or(`institution_id.eq.${profile.institution_id},is_global.eq.true`).limit(4),
    ]);

  const latestMood = moodLogs?.[0];
  const moodOption = MOOD_OPTIONS.find((m) => m.value === latestMood?.mood);
  const name = profile.display_name?.split(" ")[0] ?? "there";

  const activeCases = cases?.filter(c => c.status !== "resolved") ?? [];
  const moodAvg = moodLogs && moodLogs.length > 0
    ? Math.round((moodLogs.reduce((s, m) => s + m.mood, 0) / moodLogs.length) * 10) / 10
    : null;

  const stats = [
    {
      label: "AI Conversations",
      value: conversations?.length ?? 0,
      sub: "Total sessions",
      icon: MessageCircle,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      href: "/chat",
    },
    {
      label: "Avg Mood Score",
      value: moodAvg ? `${moodAvg}/5` : "—",
      sub: "Last 7 logs",
      icon: Smile,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      href: "/mood",
    },
    {
      label: "Active Cases",
      value: activeCases.length,
      sub: "Needing attention",
      icon: FolderOpen,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      href: "/cases",
    },
    {
      label: "Resources",
      value: resources?.length ?? 0,
      sub: "Available to you",
      icon: BookOpen,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      href: "/resources",
    },
  ];

  const quickActions = [
    { href: "/chat", icon: MessageCircle, label: "Talk to AI", sub: "Start a conversation", color: "bg-[#193852] text-white", hover: "hover:bg-[#193852]/90" },
    { href: "/mood", icon: Smile, label: "Log Mood", sub: "Daily check-in", color: "bg-violet-500/10 text-violet-700", hover: "hover:bg-violet-500/15" },
    { href: "/resources", icon: BookOpen, label: "Resources", sub: "Articles & helplines", color: "bg-emerald-500/10 text-emerald-700", hover: "hover:bg-emerald-500/15" },
    { href: "/cases", icon: FolderOpen, label: "My Cases", sub: "View updates", color: "bg-amber-500/10 text-amber-700", hover: "hover:bg-amber-500/15" },
  ];

  const severityConfig: Record<string, { icon: typeof AlertTriangle; bg: string; text: string }> = {
    critical: { icon: AlertTriangle, bg: "bg-red-50", text: "text-red-600" },
    high:     { icon: AlertTriangle, bg: "bg-orange-50", text: "text-orange-600" },
    medium:   { icon: Clock,         bg: "bg-amber-50",  text: "text-amber-600" },
    low:      { icon: CheckCircle2,  bg: "bg-green-50",  text: "text-green-600" },
  };

  return (
    <div className="space-y-7 pb-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#193852]">
            Good day, {name} 👋
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">Your safe space for wellbeing support</p>
        </div>
        <Button asChild className="hidden bg-[#193852] hover:bg-[#193852]/90 sm:flex">
          <Link href="/chat" className="gap-2">
            <MessageCircle className="h-4 w-4" /> New conversation
          </Link>
        </Button>
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

      {/* Main grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Quick actions — wide */}
        <div className="lg:col-span-2 space-y-5">
          {/* Quick access */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#193852]">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickActions.map((a) => (
                <Link key={a.href} href={a.href}
                  className={cn("group flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-all", a.color, a.hover)}
                >
                  <a.icon className="h-6 w-6" />
                  <div>
                    <p className="text-xs font-bold">{a.label}</p>
                    <p className="mt-0.5 text-[10px] opacity-70">{a.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent conversations */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#193852]" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#193852]">Recent Conversations</h2>
              </div>
              <Link href="/chat" className="flex items-center gap-1 text-xs font-semibold text-[#a38016] hover:underline">
                New chat <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {conversations && conversations.length > 0 ? (
                conversations.map((conv) => (
                  <Link key={conv.id} href={`/chat?id=${conv.id}`}
                    className="flex items-center justify-between py-3 transition-colors hover:text-[#193852]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                        <MessageCircle className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">{conv.title ?? "Conversation"}</p>
                    </div>
                    <p className="text-xs text-gray-400">{formatDate(conv.updated_at)}</p>
                  </Link>
                ))
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                    <MessageCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">No conversations yet</p>
                  <p className="mt-1 text-xs text-gray-400">Your AI conversations will appear here</p>
                  <Link href="/chat"
                    className="mt-3 rounded-lg bg-[#193852] px-4 py-2 text-xs font-bold text-white hover:bg-[#193852]/90"
                  >
                    Start talking
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Mood status */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#193852]" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#193852]">Mood Status</h2>
              </div>
              <Link href="/mood" className="text-xs font-semibold text-[#a38016] hover:underline">History</Link>
            </div>
            {moodOption ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                  <span className="text-3xl">{moodOption.emoji}</span>
                  <div>
                    <p className="font-bold text-[#193852]">{moodOption.label}</p>
                    <p className="text-xs text-gray-400">Logged {formatDate(latestMood!.logged_at)}</p>
                  </div>
                </div>
                {moodAvg && (
                  <div className="rounded-xl bg-violet-50 px-3 py-2">
                    <p className="text-xs text-violet-600">7-day average: <strong>{moodAvg}/5</strong></p>
                  </div>
                )}
                <Link href="/mood"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#193852] py-2.5 text-xs font-bold text-white hover:bg-[#193852]/90"
                >
                  Log today <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <span className="mb-2 text-3xl">😶</span>
                <p className="text-sm font-semibold text-gray-600">No mood logged yet</p>
                <p className="mt-1 text-xs text-gray-400">Daily check-ins help spot patterns</p>
                <Link href="/mood"
                  className="mt-3 rounded-lg bg-[#193852] px-4 py-2 text-xs font-bold text-white hover:bg-[#193852]/90"
                >
                  Log now
                </Link>
              </div>
            )}
          </div>

          {/* Active cases */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-[#193852]" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#193852]">Active Cases</h2>
              </div>
              <Link href="/cases" className="text-xs font-semibold text-[#a38016] hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {activeCases.length > 0 ? (
                activeCases.slice(0, 3).map((c) => {
                  const sev = severityConfig[c.severity] ?? severityConfig.low;
                  return (
                    <Link key={c.id} href={`/cases?id=${c.id}`}
                      className="flex items-start gap-3 rounded-xl border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                    >
                      <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", sev.bg)}>
                        <sev.icon className={cn("h-3.5 w-3.5", sev.text)} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold capitalize text-gray-700">
                          {c.incident_type?.replace(/_/g, " ")}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400 line-clamp-2">{c.summary}</p>
                        <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium capitalize text-gray-600">
                          {CASE_STATUS_LABELS[c.status]}
                        </span>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="py-4 text-center">
                  <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-400" />
                  <p className="text-xs text-gray-400">No active cases</p>
                </div>
              )}
            </div>
          </div>

          {/* Resources */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#193852]" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#193852]">Resources</h2>
              </div>
              <Link href="/resources" className="text-xs font-semibold text-[#a38016] hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {resources && resources.length > 0 ? (
                resources.map((r) => (
                  <Link key={r.id} href="/resources"
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-50"
                  >
                    <p className="text-sm font-medium text-gray-700">{r.title}</p>
                    <Badge className="ml-3 shrink-0 bg-[#193852]/10 text-[#193852] text-[10px] hover:bg-[#193852]/10">
                      {r.category}
                    </Badge>
                  </Link>
                ))
              ) : (
                <p className="py-3 text-xs text-gray-400">Resources coming soon</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
