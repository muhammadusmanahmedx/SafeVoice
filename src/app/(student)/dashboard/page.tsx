import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { StudentDashboardView } from "@/components/student/student-dashboard-view";
import type { CaseStatus, MoodLevel } from "@/types";

export default async function StudentDashboard() {
  const profile = await requireProfile(["student"]);
  const supabase = await createClient();

  const [{ data: moodLogs }, { data: conversations }, { data: cases }, { data: resources }, { data: announcements }] =
    await Promise.all([
      supabase
        .from("mood_logs")
        .select("*")
        .eq("student_id", profile.id)
        .order("logged_at", { ascending: false })
        .limit(7),
      supabase
        .from("conversations")
        .select("id, title, updated_at")
        .eq("student_id", profile.id)
        .order("updated_at", { ascending: false })
        .limit(3),
      supabase
        .from("cases")
        .select("id, status, summary, created_at, severity, incident_type")
        .eq("student_id", profile.id)
        .neq("status", "resolved")
        .limit(5),
      supabase
        .from("resources")
        .select("id, title, category, type")
        .or(`institution_id.eq.${profile.institution_id},is_global.eq.true`)
        .limit(4),
      supabase
        .from("announcements")
        .select("id, title, content, published_at")
        .eq("institution_id", profile.institution_id)
        .order("published_at", { ascending: false })
        .limit(3),
    ]);

  const latestMood = moodLogs?.[0];
  const name = profile.display_name?.split(" ")[0] ?? "there";

  const moodAvg =
    moodLogs && moodLogs.length > 0
      ? Math.round((moodLogs.reduce((s, m) => s + m.mood, 0) / moodLogs.length) * 10) / 10
      : null;

  return (
    <StudentDashboardView
      name={name}
      announcements={(announcements ?? []).map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
      }))}
      conversations={conversations ?? []}
      cases={(cases ?? []) as { id: string; status: CaseStatus; summary: string; created_at: string; severity: string; incident_type: string }[]}
      resources={resources ?? []}
      latestMood={
        latestMood
          ? { mood: latestMood.mood as MoodLevel, logged_at: latestMood.logged_at }
          : undefined
      }
      moodAvg={moodAvg}
    />
  );
}
