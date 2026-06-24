import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { StudentCaseDetail } from "@/components/student/case-detail";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CASE_STATUS_LABELS, RISK_LEVEL_COLORS } from "@/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const profile = await requireProfile(["student"]);
  const { id } = await searchParams;
  const supabase = await createClient();

  const { data: cases } = await supabase
    .from("cases")
    .select("*")
    .eq("student_id", profile.id)
    .order("created_at", { ascending: false });

  if (id) {
    const caseData = cases?.find((c) => c.id === id);
    if (!caseData) {
      return <p>Case not found</p>;
    }

    const [{ data: messages }, { data: revealRequests }] = await Promise.all([
      supabase
        .from("case_messages")
        .select("*")
        .eq("case_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("identity_reveal_requests")
        .select("*")
        .eq("case_id", id)
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

    return (
      <div className="space-y-4">
        <Link href="/cases" className="text-sm text-primary hover:underline">
          ← Back to cases
        </Link>
        <StudentCaseDetail
          caseData={caseData}
          messages={messages ?? []}
          revealRequest={revealRequests?.[0]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Cases</h1>
        <p className="text-sm text-muted-foreground">Track your anonymous support cases</p>
      </div>

      <div className="space-y-3">
        {cases && cases.length > 0 ? (
          cases.map((c) => (
            <Link key={c.id} href={`/cases?id=${c.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium capitalize">{c.incident_type.replace("_", " ")}</p>
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{c.summary}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <Badge variant="outline">{CASE_STATUS_LABELS[c.status]}</Badge>
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-xs capitalize",
                          RISK_LEVEL_COLORS[c.severity]
                        )}
                      >
                        {c.severity}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No cases yet. If you need support, start a conversation with the AI assistant.
          </p>
        )}
      </div>
    </div>
  );
}
