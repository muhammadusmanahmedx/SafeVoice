"use client";

import Link from "next/link";
import { AnnouncementsBannerView } from "@/components/student/announcements-banner-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import {
  getCaseStatusLabel,
  getIncidentTypeLabel,
  getMoodLabel,
  getResourceCategoryLabel,
  MOOD_EMOJIS,
} from "@/lib/i18n/labels";
import type { CaseStatus, MoodLevel } from "@/types";
import {
  MessageCircle, Smile, BookOpen, FolderOpen, Calendar,
  ArrowRight, TrendingUp, Sparkles,
  AlertTriangle, CheckCircle2, Clock,
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

interface StudentDashboardViewProps {
  name: string;
  announcements: { id: string; title: string; content: string }[];
  conversations: { id: string; title: string | null; updated_at: string }[];
  cases: {
    id: string;
    status: CaseStatus;
    summary: string;
    created_at: string;
    severity: string;
    incident_type: string;
  }[];
  resources: { id: string; title: string; category: string; type: string }[];
  latestMood: { mood: MoodLevel; logged_at: string } | undefined;
  moodAvg: number | null;
}

export function StudentDashboardView({
  name,
  announcements,
  conversations,
  cases,
  resources,
  latestMood,
  moodAvg,
}: StudentDashboardViewProps) {
  const { t } = useLanguage();

  const activeCases = cases.filter((c) => c.status !== "resolved");

  const stats = [
    {
      label: t("student.dashboard.stats.aiConversations"),
      value: conversations.length,
      sub: t("student.dashboard.stats.totalSessions"),
      icon: MessageCircle,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      href: "/chat",
    },
    {
      label: t("student.dashboard.stats.avgMoodScore"),
      value: moodAvg ? `${moodAvg}/5` : "—",
      sub: t("student.dashboard.stats.last7Logs"),
      icon: Smile,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      href: "/mood",
    },
    {
      label: t("student.dashboard.stats.activeCases"),
      value: activeCases.length,
      sub: t("student.dashboard.stats.needingAttention"),
      icon: FolderOpen,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      href: "/cases",
    },
    {
      label: t("student.dashboard.stats.resources"),
      value: resources.length,
      sub: t("student.dashboard.stats.availableToYou"),
      icon: BookOpen,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      href: "/resources",
    },
  ];

  const quickActions = [
    {
      href: "/chat",
      icon: MessageCircle,
      label: t("student.dashboard.quickActions.talkToAi"),
      sub: t("student.dashboard.quickActions.startConversation"),
      color: "bg-[#193852] text-white",
      hover: "hover:bg-[#193852]/90",
    },
    {
      href: "/mood",
      icon: Smile,
      label: t("student.dashboard.quickActions.logMood"),
      sub: t("student.dashboard.quickActions.dailyCheckIn"),
      color: "bg-violet-500/10 text-violet-700",
      hover: "hover:bg-violet-500/15",
    },
    {
      href: "/resources",
      icon: BookOpen,
      label: t("student.dashboard.quickActions.resources"),
      sub: t("student.dashboard.quickActions.articlesHelplines"),
      color: "bg-emerald-500/10 text-emerald-700",
      hover: "hover:bg-emerald-500/15",
    },
    {
      href: "/counseling",
      icon: Calendar,
      label: t("student.dashboard.quickActions.counseling"),
      sub: t("student.dashboard.quickActions.bookSession"),
      color: "bg-teal-500/10 text-teal-700",
      hover: "hover:bg-teal-500/15",
    },
    {
      href: "/cases",
      icon: FolderOpen,
      label: t("student.dashboard.quickActions.myCases"),
      sub: t("student.dashboard.quickActions.viewUpdates"),
      color: "bg-amber-500/10 text-amber-700",
      hover: "hover:bg-amber-500/15",
    },
  ];

  const severityConfig: Record<string, { icon: typeof AlertTriangle; bg: string; text: string }> = {
    critical: { icon: AlertTriangle, bg: "bg-red-50", text: "text-red-600" },
    high: { icon: AlertTriangle, bg: "bg-orange-50", text: "text-orange-600" },
    medium: { icon: Clock, bg: "bg-amber-50", text: "text-amber-600" },
    low: { icon: CheckCircle2, bg: "bg-green-50", text: "text-green-600" },
  };

  const moodEmoji = latestMood ? MOOD_EMOJIS[latestMood.mood] : null;
  const moodLabel = latestMood ? getMoodLabel(t, latestMood.mood) : null;

  return (
    <div className="space-y-7 pb-6">
      <AnnouncementsBannerView announcements={announcements} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#193852]">
            {t("student.dashboard.greeting").replace(
              "{name}",
              name === "there" ? t("common.there") : name
            )}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">{t("student.dashboard.subtitle")}</p>
        </div>
        <Button asChild className="hidden bg-[#193852] hover:bg-[#193852]/90 sm:flex">
          <Link href="/chat" className="gap-2">
            <MessageCircle className="h-4 w-4" /> {t("student.dashboard.newConversation")}
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.href}
            href={s.href}
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

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#193852]">
                {t("student.dashboard.quickActions.title")}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {quickActions.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className={cn(
                    "group flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-all",
                    a.color,
                    a.hover
                  )}
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

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#193852]" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#193852]">
                  {t("student.dashboard.recentConversations.title")}
                </h2>
              </div>
              <Link href="/chat" className="flex items-center gap-1 text-xs font-semibold text-[#a38016] hover:underline">
                {t("student.dashboard.recentConversations.newChat")} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {conversations.length > 0 ? (
                conversations.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/chat?id=${conv.id}`}
                    className="flex items-center justify-between py-3 transition-colors hover:text-[#193852]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                        <MessageCircle className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        {conv.title ?? t("common.conversationDefaultTitle")}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">{formatDate(conv.updated_at)}</p>
                  </Link>
                ))
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                    <MessageCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">
                    {t("student.dashboard.recentConversations.noConversations")}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {t("student.dashboard.recentConversations.emptyHint")}
                  </p>
                  <Link
                    href="/chat"
                    className="mt-3 rounded-lg bg-[#193852] px-4 py-2 text-xs font-bold text-white hover:bg-[#193852]/90"
                  >
                    {t("student.dashboard.recentConversations.startTalking")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#193852]" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#193852]">
                  {t("student.dashboard.moodStatus.title")}
                </h2>
              </div>
              <Link href="/mood" className="text-xs font-semibold text-[#a38016] hover:underline">
                {t("student.dashboard.moodStatus.history")}
              </Link>
            </div>
            {latestMood && moodEmoji && moodLabel ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                  <span className="text-3xl">{moodEmoji}</span>
                  <div>
                    <p className="font-bold text-[#193852]">{moodLabel}</p>
                    <p className="text-xs text-gray-400">
                      {t("student.dashboard.moodStatus.logged").replace(
                        "{date}",
                        formatDate(latestMood.logged_at)
                      )}
                    </p>
                  </div>
                </div>
                {moodAvg && (
                  <div className="rounded-xl bg-violet-50 px-3 py-2">
                    <p className="text-xs text-violet-600">
                      {t("student.dashboard.moodStatus.sevenDayAverage")}{" "}
                      <strong>{moodAvg}/5</strong>
                    </p>
                  </div>
                )}
                <Link
                  href="/mood"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#193852] py-2.5 text-xs font-bold text-white hover:bg-[#193852]/90"
                >
                  {t("student.dashboard.moodStatus.logToday")} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <span className="mb-2 text-3xl">😶</span>
                <p className="text-sm font-semibold text-gray-600">
                  {t("student.dashboard.moodStatus.noMoodLogged")}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {t("student.dashboard.moodStatus.checkInHint")}
                </p>
                <Link
                  href="/mood"
                  className="mt-3 rounded-lg bg-[#193852] px-4 py-2 text-xs font-bold text-white hover:bg-[#193852]/90"
                >
                  {t("student.dashboard.moodStatus.logNow")}
                </Link>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-[#193852]" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#193852]">
                  {t("student.dashboard.activeCases.title")}
                </h2>
              </div>
              <Link href="/cases" className="text-xs font-semibold text-[#a38016] hover:underline">
                {t("common.viewAll")}
              </Link>
            </div>
            <div className="space-y-2">
              {activeCases.length > 0 ? (
                activeCases.slice(0, 3).map((c) => {
                  const sev = severityConfig[c.severity] ?? severityConfig.low;
                  return (
                    <Link
                      key={c.id}
                      href={`/cases?id=${c.id}`}
                      className="flex items-start gap-3 rounded-xl border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                    >
                      <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", sev.bg)}>
                        <sev.icon className={cn("h-3.5 w-3.5", sev.text)} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold capitalize text-gray-700">
                          {getIncidentTypeLabel(t, c.incident_type)}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400 line-clamp-2">{c.summary}</p>
                        <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium capitalize text-gray-600">
                          {getCaseStatusLabel(t, c.status)}
                        </span>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="py-4 text-center">
                  <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-400" />
                  <p className="text-xs text-gray-400">{t("student.dashboard.activeCases.noActiveCases")}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#193852]" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#193852]">
                  {t("student.dashboard.resourcesSection.title")}
                </h2>
              </div>
              <Link href="/resources" className="text-xs font-semibold text-[#a38016] hover:underline">
                {t("common.viewAll")}
              </Link>
            </div>
            <div className="space-y-2">
              {resources.length > 0 ? (
                resources.map((r) => (
                  <Link
                    key={r.id}
                    href="/resources"
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-50"
                  >
                    <p className="text-sm font-medium text-gray-700">{r.title}</p>
                    <Badge className="ml-3 shrink-0 bg-[#193852]/10 text-[#193852] text-[10px] hover:bg-[#193852]/10">
                      {getResourceCategoryLabel(t, r.category)}
                    </Badge>
                  </Link>
                ))
              ) : (
                <p className="py-3 text-xs text-gray-400">{t("student.dashboard.resourcesSection.comingSoon")}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
