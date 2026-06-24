import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { AnnouncementsManager } from "@/components/admin/announcements-manager";

export default async function AdminAnnouncementsPage() {
  const profile = await requireProfile(["admin"]);
  const supabase = await createClient();

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, content, published_at")
    .eq("institution_id", profile.institution_id)
    .order("published_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Announcements</h1>
        <p className="text-sm text-muted-foreground">Publish updates visible to faculty members</p>
      </div>
      <AnnouncementsManager announcements={announcements ?? []} />
    </div>
  );
}
