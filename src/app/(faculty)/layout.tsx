import { PortalShell } from "@/components/layout/portal-shell";
import { requireProfile } from "@/lib/auth/get-profile";

const navItems = [
  { href: "/faculty/dashboard", label: "Dashboard", icon: "layout-dashboard" as const },
  { href: "/faculty/alerts", label: "Alert Inbox", icon: "bell" as const },
  { href: "/faculty/cases", label: "Cases", icon: "folder-open" as const },
  { href: "/faculty/patterns", label: "Patterns", icon: "trending-up" as const },
];

export default async function FacultyLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile(["faculty", "admin"]);

  return (
    <PortalShell
      title="Faculty Portal"
      subtitle={profile.institutions?.name ?? "Safeguarding"}
      navItems={navItems}
      userId={profile.id}
      role="faculty"
    >
      {children}
    </PortalShell>
  );
}
