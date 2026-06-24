import { PortalShell } from "@/components/layout/portal-shell";
import { requireProfile } from "@/lib/auth/get-profile";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "layout-dashboard" as const },
  { href: "/admin/faculty", label: "Faculty", icon: "users" as const },
  { href: "/admin/announcements", label: "Announcements", icon: "megaphone" as const },
  { href: "/admin/reports", label: "Reports", icon: "file-bar-chart" as const },
  { href: "/admin/settings", label: "Settings", icon: "settings" as const },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile(["admin"]);

  return (
    <PortalShell
      title="Admin Portal"
      subtitle={profile.institutions?.name ?? "Institution Management"}
      navItems={navItems}
      userId={profile.id}
      role="admin"
    >
      {children}
    </PortalShell>
  );
}
