import { PortalShell } from "@/components/layout/portal-shell";
import { requireProfile } from "@/lib/auth/get-profile";

const navItems = [
  { href: "/faculty/dashboard", labelKey: "nav.dashboard", icon: "layout-dashboard" as const },
  { href: "/faculty/alerts", labelKey: "nav.alertInbox", icon: "bell" as const },
  { href: "/faculty/cases", labelKey: "nav.cases", icon: "folder-open" as const },
  { href: "/faculty/counseling", labelKey: "nav.counseling", icon: "calendar" as const },
  { href: "/faculty/patterns", labelKey: "nav.patterns", icon: "trending-up" as const },
];

export default async function FacultyLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile(["faculty", "admin"]);

  return (
    <PortalShell
      titleKey="portal.faculty"
      subtitle={profile.institutions?.name ?? undefined}
      navItems={navItems}
      userId={profile.id}
      role="faculty"
    >
      {children}
    </PortalShell>
  );
}
