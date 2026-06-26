import { createClient } from "@/lib/supabase/server";
import { AnnouncementsBannerView } from "@/components/student/announcements-banner-view";

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

  return <AnnouncementsBannerView announcements={announcements} />;
}
