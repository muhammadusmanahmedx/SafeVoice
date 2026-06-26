import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { FacultyPatternsView } from "@/components/faculty/faculty-patterns-view";
import { subDays } from "date-fns";

export default async function PatternsPage() {
  const profile = await requireProfile(["faculty", "admin"]);
  const supabase = await createClient();

  const since = subDays(new Date(), 14).toISOString();
  const { data: cases } = await supabase
    .from("anonymous_cases" as "cases")
    .select("location, incident_type, created_at")
    .eq("institution_id", profile.institution_id)
    .gte("created_at", since)
    .not("location", "is", null);

  const patterns = new Map<string, { count: number; type: string; latest: string }>();
  for (const c of cases ?? []) {
    const key = `${c.location}::${c.incident_type}`;
    const existing = patterns.get(key);
    if (existing) {
      existing.count++;
      if (c.created_at > existing.latest) existing.latest = c.created_at;
    } else {
      patterns.set(key, { count: 1, type: c.incident_type, latest: c.created_at });
    }
  }

  const recurring = Array.from(patterns.entries())
    .filter(([, v]) => v.count >= 2)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([key, data]) => {
      const [location] = key.split("::");
      return { location, incidentType: data.type, count: data.count };
    });

  return <FacultyPatternsView patterns={recurring} />;
}
