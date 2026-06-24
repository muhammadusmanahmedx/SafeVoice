import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    .sort((a, b) => b[1].count - a[1].count);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pattern Detection</h1>
        <p className="text-sm text-muted-foreground">
          Recurring reports within the last 14 days — no student identities shown
        </p>
      </div>

      <div className="space-y-3">
        {recurring.length > 0 ? (
          recurring.map(([key, data]) => {
            const [location] = key.split("::");
            return (
              <Card key={key}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{location}</CardTitle>
                    <Badge>{data.count} reports</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm capitalize text-muted-foreground">
                    Issue type: {data.type.replace("_", " ")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {data.count} anonymous reports mention this location within two weeks
                  </p>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground">No recurring patterns detected.</p>
        )}
      </div>
    </div>
  );
}
