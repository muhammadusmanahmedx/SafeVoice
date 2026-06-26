import { PortalShell } from "@/components/layout/portal-shell";
import { requireProfile } from "@/lib/auth/get-profile";

const navItems = [
  { href: "/counselor/dashboard", labelKey: "nav.dashboard", icon: "layout-dashboard" as const },
  { href: "/counselor/alerts", labelKey: "nav.alertInbox", icon: "bell" as const },
  { href: "/counselor/cases", labelKey: "nav.cases", icon: "folder-open" as const },
  { href: "/counselor/counseling", labelKey: "nav.counseling", icon: "calendar" as const },
  { href: "/counselor/patterns", labelKey: "nav.patterns", icon: "trending-up" as const },
];

export default async function FacultyLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile(["counselor", "admin"]);

  return (
    <PortalShell
      titleKey="portal.counselor"
      subtitle={profile.institutions?.name ?? undefined}
      navItems={navItems}
      userId={profile.id}
      role="counselor"
    >
      {children}
    </PortalShell>
  );
}
