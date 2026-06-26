import { requireProfile } from "@/lib/auth/get-profile";
import { getMoodLogs } from "@/lib/actions/mood";
import { generateMoodInsight } from "@/lib/ai/chat";
import { MoodPageView } from "@/components/student/mood-page-view";
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

  return <MoodPageView weekLogs={weekLogs} monthLogs={monthLogs} insight={insight} />;
}
