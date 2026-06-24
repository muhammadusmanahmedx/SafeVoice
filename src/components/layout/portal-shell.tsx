"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { signOut } from "@/lib/auth/actions";
import {
  Bell, BookOpen, FileBarChart, FolderOpen, LayoutDashboard,
  LogOut, Megaphone, Menu, MessageCircle, Settings,
  Shield, Smile, TrendingUp, Users, X, type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { NotificationBell } from "@/components/layout/notification-bell";

const NAV_ICONS = {
  "layout-dashboard": LayoutDashboard,
  "message-circle": MessageCircle,
  smile: Smile,
  "book-open": BookOpen,
  "folder-open": FolderOpen,
  bell: Bell,
  "trending-up": TrendingUp,
  users: Users,
  megaphone: Megaphone,
  "file-bar-chart": FileBarChart,
  settings: Settings,
} satisfies Record<string, LucideIcon>;

export type NavIconName = keyof typeof NAV_ICONS;

interface NavItem { href: string; label: string; icon: NavIconName }

interface PortalShellProps {
  title: string;
  subtitle?: string;
  navItems: NavItem[];
  children: React.ReactNode;
  userId?: string;
  role?: string;
}

export function PortalShell({ title, subtitle, navItems, children, userId, role }: PortalShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-card">
      {/* Logo + notification */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold leading-none">SafeVoice</p>
            <p className="text-[10px] text-muted-foreground">{title}</p>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          {userId && <NotificationBell userId={userId} role={role} />}
          <Button variant="ghost" size="icon" className="h-7 w-7 lg:hidden" onClick={() => setMobileOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Institution */}
      {subtitle && (
        <div className="border-b border-border px-4 py-2.5">
          <p className="truncate text-xs font-medium text-muted-foreground">{subtitle}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = NAV_ICONS[item.icon];
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-2">
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <form action={signOut} className="flex-1">
            <Button variant="ghost" size="sm" type="submit"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar — always visible, never scrolls */}
      <div className="hidden lg:flex">{sidebar}</div>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">{sidebar}</div>
        </>
      )}

      {/* Main — this is the ONLY thing that scrolls */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex h-14 shrink-0 items-center border-b border-border px-4 lg:hidden">
          <Button variant="ghost" size="icon" className="mr-3" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold">{title}</span>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
