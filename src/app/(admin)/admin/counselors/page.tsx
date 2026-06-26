import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { AdminCounselorsView } from "@/components/admin/counselor-management-view";

export default async function AdminCounselorsPage() {
  const profile = await requireProfile(["admin"]);
  const supabase = await createClient();

  const [{ data: counselors }, { data: codes }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, is_active, created_at")
      .eq("institution_id", profile.institution_id)
      .eq("role", "counselor")
      .order("created_at", { ascending: false }),
    supabase
      .from("counselor_codes")
      .select("id, code, expires_at, used_by, created_at")
      .eq("institution_id", profile.institution_id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return <AdminCounselorsView counselors={counselors ?? []} codes={codes ?? []} />;
}
