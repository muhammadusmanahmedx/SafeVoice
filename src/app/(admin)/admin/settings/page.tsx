import { requireProfile } from "@/lib/auth/get-profile";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  const profile = await requireProfile(["admin"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your institution configuration</p>
      </div>
      <SettingsForm institutionName={profile.institutions?.name ?? ""} />
    </div>
  );
}
