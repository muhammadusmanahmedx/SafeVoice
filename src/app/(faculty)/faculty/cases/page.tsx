import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CASE_STATUS_LABELS, RISK_LEVEL_COLORS } from "@/types";
import { cn, formatDate } from "@/lib/utils";

export default async function FacultyCasesPage() {
  const profile = await requireProfile(["faculty", "admin"]);
  const supabase = await createClient();

  const { data: cases } = await supabase
    .from("anonymous_cases" as "cases")
    .select("*")
    .eq("institution_id", profile.institution_id)
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Case Management</h1>
        <p className="text-sm text-muted-foreground">All anonymous cases — no student identities shown</p>
      </div>

      <div className="space-y-3">
        {(cases ?? []).map((c) => (
          <Link key={c.id} href={`/faculty/cases/${c.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{CASE_STATUS_LABELS[c.status]}</Badge>
                    {(c as { auto_alerted?: boolean }).auto_alerted && (
                      <Badge variant="secondary" className="text-amber-700 bg-amber-500/10">
                        Auto-alert
                      </Badge>
                    )}
                    <span className="text-xs capitalize text-muted-foreground">
                      {c.incident_type.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-1 text-sm">{c.summary}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(c.created_at)}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1 text-xs capitalize",
                    RISK_LEVEL_COLORS[c.severity]
                  )}
                >
                  {c.severity}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
