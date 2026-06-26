import { PortalShell } from "@/components/layout/portal-shell";
import { requireProfile } from "@/lib/auth/get-profile";

const navItems = [
  { href: "/admin/dashboard", labelKey: "nav.dashboard", icon: "layout-dashboard" as const },
  { href: "/admin/counselors", labelKey: "nav.counselor", icon: "users" as const },
  { href: "/admin/announcements", labelKey: "nav.announcements", icon: "megaphone" as const },
  { href: "/admin/reports", labelKey: "nav.reports", icon: "file-bar-chart" as const },
  { href: "/admin/settings", labelKey: "nav.settings", icon: "settings" as const },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile(["admin"]);

  return (
    <PortalShell
      titleKey="portal.admin"
      subtitle={profile.institutions?.name ?? undefined}
      navItems={navItems}
      userId={profile.id}
      role="admin"
    >
      {children}
    </PortalShell>
  );
}
