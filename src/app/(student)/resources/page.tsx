import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { ResourcesPageView } from "@/components/student/resources-page-view";
import { RESOURCE_CATEGORIES } from "@/types";

export default async function ResourcesPage() {
  const profile = await requireProfile(["student"]);
  const supabase = await createClient();

  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .or(`institution_id.eq.${profile.institution_id},is_global.eq.true`)
    .order("category");

  const grouped = RESOURCE_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = (resources ?? []).filter((r) => r.category === cat);
      return acc;
    },
    {} as Record<string, NonNullable<typeof resources>>
  );

  return <ResourcesPageView grouped={grouped} />;
}
