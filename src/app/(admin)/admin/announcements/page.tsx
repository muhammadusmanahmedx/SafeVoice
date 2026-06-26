import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { AdminAnnouncementsView } from "@/components/admin/admin-announcements-view";

export default async function AdminAnnouncementsPage() {
  const profile = await requireProfile(["admin"]);
  const supabase = await createClient();

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, content, published_at")
    .eq("institution_id", profile.institution_id)
    .order("published_at", { ascending: false });

  return <AdminAnnouncementsView announcements={announcements ?? []} />;
}
