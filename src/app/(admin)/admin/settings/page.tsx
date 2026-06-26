import { requireProfile } from "@/lib/auth/get-profile";
import { AdminSettingsView } from "@/components/admin/admin-settings-view";

export default async function AdminSettingsPage() {
  const profile = await requireProfile(["admin"]);

  return <AdminSettingsView institutionName={profile.institutions?.name ?? ""} />;
}
