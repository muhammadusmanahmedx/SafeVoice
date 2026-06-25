import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Megaphone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnnouncementsBannerProps {
  institutionId: string;
}

export async function AnnouncementsBanner({ institutionId }: AnnouncementsBannerProps) {
  const supabase = await createClient();

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, content, published_at")
    .eq("institution_id", institutionId)
    .order("published_at", { ascending: false })
    .limit(3);

  if (!announcements?.length) return null;

  const latest = announcements[0];

  return (
    <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Megaphone className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Institution Announcement
          </p>
          <p className="mt-0.5 text-sm font-semibold">{latest.title}</p>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{latest.content}</p>
          <Button asChild size="sm" className="mt-3 gap-1.5">
            <Link href="/counseling">
              <Calendar className="h-3.5 w-3.5" />
              Book a counseling session
            </Link>
          </Button>
          {announcements.length > 1 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-medium text-primary hover:underline">
                {announcements.length - 1} more announcement{announcements.length > 2 ? "s" : ""}
              </summary>
              <div className="mt-2 space-y-2 border-t border-border/60 pt-2">
                {announcements.slice(1).map((a) => (
                  <div key={a.id}>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.content}</p>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
