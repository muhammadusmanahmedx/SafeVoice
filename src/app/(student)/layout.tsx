import { PortalShell } from "@/components/layout/portal-shell";
import { requireProfile } from "@/lib/auth/get-profile";

const navItems = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: "layout-dashboard" as const },
  { href: "/chat", labelKey: "nav.aiAssistant", icon: "message-circle" as const },
  { href: "/mood", labelKey: "nav.mood", icon: "smile" as const },
  { href: "/resources", labelKey: "nav.resources", icon: "book-open" as const },
  { href: "/counseling", labelKey: "nav.counseling", icon: "calendar" as const },
  { href: "/cases", labelKey: "nav.myCases", icon: "folder-open" as const },
];

const mobileNavItems = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: "layout-dashboard" as const },
  { href: "/counseling", labelKey: "nav.counseling", icon: "calendar" as const },
  { href: "/chat", labelKey: "nav.aiAssistant", icon: "message-circle" as const },
  { href: "/mood", labelKey: "nav.mood", icon: "smile" as const },
  { href: "/resources", labelKey: "nav.resources", icon: "book-open" as const },
];

const profileMenuItems = [
  { href: "/cases", labelKey: "nav.myCases", icon: "folder-open" as const },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile(["student"]);

  return (
    <PortalShell
      titleKey="portal.student"
      subtitle={profile.institutions?.name ?? undefined}
      navItems={navItems}
      mobileNavItems={mobileNavItems}
      profileMenuItems={profileMenuItems}
      userId={profile.id}
      role="student"
    >
      {children}
    </PortalShell>
  );
}
