"use client";

import { MoodLogger } from "@/components/student/mood-logger";
import { MoodChart } from "@/components/student/mood-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/components/providers/language-provider";

interface MoodPageViewProps {
  weekLogs: { logged_at: string; mood: number }[];
  monthLogs: { logged_at: string; mood: number }[];
  insight: string;
}

export function MoodPageView({ weekLogs, monthLogs, insight }: MoodPageViewProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("student.mood.pageTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("student.mood.pageSubtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("student.mood.logTodayTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <MoodLogger />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <MoodChart data={weekLogs} title={t("student.mood.weeklyChart")} />
        <MoodChart data={monthLogs} title={t("student.mood.monthlyChart")} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("student.mood.insightTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">{insight}</p>
        </CardContent>
      </Card>
    </div>
  );
}
