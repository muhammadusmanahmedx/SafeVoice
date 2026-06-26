"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { useLanguage } from "@/components/providers/language-provider";
import { signOut } from "@/lib/auth/actions";
import {
  Bell, BookOpen, Calendar, FileBarChart, FolderOpen, LayoutDashboard,
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
  calendar: Calendar,
  "folder-open": FolderOpen,
  bell: Bell,
  "trending-up": TrendingUp,
  users: Users,
  megaphone: Megaphone,
  "file-bar-chart": FileBarChart,
  settings: Settings,
} satisfies Record<string, LucideIcon>;

export type NavIconName = keyof typeof NAV_ICONS;

interface NavItem {
  href: string;
  labelKey: string;
  icon: NavIconName;
}

interface PortalShellProps {
  titleKey: string;
  subtitle?: string;
  navItems: NavItem[];
  children: React.ReactNode;
  userId?: string;
  role?: string;
}

export function PortalShell({
  titleKey,
  subtitle,
  navItems,
  children,
  userId,
  role,
}: PortalShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();
  const title = t(titleKey);

  const sidebar = (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-e border-border bg-card">
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

      {subtitle && (
        <div className="border-b border-border px-4 py-2.5">
          <p className="truncate text-xs font-medium text-muted-foreground">{subtitle}</p>
        </div>
      )}

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
                {t(item.labelKey)}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-border p-2">
        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
          <form action={signOut} className="flex-1">
            <Button
              variant="ghost"
              size="sm"
              type="submit"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              {t("common.signOut")}
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="order-1 hidden lg:flex rtl:order-2">{sidebar}</div>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 start-0 z-50 lg:hidden">{sidebar}</div>
        </>
      )}

      <div className="order-2 flex min-w-0 flex-1 flex-col overflow-hidden rtl:order-1">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 pt-safe lg:hidden">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="me-3" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold">{title}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto p-4 pb-safe sm:p-6">{children}</main>
      </div>
    </div>
  );
}
