import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { FacultyManagement } from "@/components/admin/faculty-management";

export default async function AdminFacultyPage() {
  const profile = await requireProfile(["admin"]);
  const supabase = await createClient();

  const [{ data: faculty }, { data: codes }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, is_active, created_at")
      .eq("institution_id", profile.institution_id)
      .eq("role", "faculty")
      .order("created_at", { ascending: false }),
    supabase
      .from("faculty_codes")
      .select("id, code, expires_at, used_by, created_at")
      .eq("institution_id", profile.institution_id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Faculty Management</h1>
        <p className="text-sm text-muted-foreground">Manage faculty accounts and registration codes</p>
      </div>
      <FacultyManagement faculty={faculty ?? []} codes={codes ?? []} />
    </div>
  );
}
