import { requireProfile } from "@/lib/auth/get-profile";
import { getMoodLogs } from "@/lib/actions/mood";
import { generateMoodInsight } from "@/lib/ai/chat";
import { MoodLogger } from "@/components/student/mood-logger";
import { MoodChart } from "@/components/student/mood-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { subDays } from "date-fns";

export default async function MoodPage() {
  await requireProfile(["student"]);
  const logs = await getMoodLogs(30);
  const weekLogs = logs.filter((l) => new Date(l.logged_at) >= subDays(new Date(), 7));
  const monthLogs = logs;

  const insight = await generateMoodInsight(
    logs.map((l) => ({
      date: l.logged_at,
      mood: l.mood,
      note: l.note,
    }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mood Tracking</h1>
        <p className="text-sm text-muted-foreground">How are you feeling today?</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Log Today&apos;s Mood</CardTitle>
        </CardHeader>
        <CardContent>
          <MoodLogger />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <MoodChart data={weekLogs} title="Weekly Mood" />
        <MoodChart data={monthLogs} title="Monthly Mood" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Wellbeing Insight</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">{insight}</p>
        </CardContent>
      </Card>
    </div>
  );
}
