import { PortalShell } from "@/components/layout/portal-shell";
import { requireProfile } from "@/lib/auth/get-profile";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "layout-dashboard" as const },
  { href: "/chat", label: "AI Assistant", icon: "message-circle" as const },
  { href: "/mood", label: "Mood", icon: "smile" as const },
  { href: "/resources", label: "Resources", icon: "book-open" as const },
  { href: "/counseling", label: "Counseling", icon: "calendar" as const },
  { href: "/cases", label: "My Cases", icon: "folder-open" as const },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile(["student"]);

  return (
    <PortalShell
      title="Student Portal"
      subtitle={profile.institutions?.name ?? "Your institution"}
      navItems={navItems}
      userId={profile.id}
      role="student"
    >
      {children}
    </PortalShell>
  );
}
