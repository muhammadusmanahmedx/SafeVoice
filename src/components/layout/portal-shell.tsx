"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { useLanguage } from "@/components/providers/language-provider";
import { signOut } from "@/lib/auth/actions";
import {
  Bell, BookOpen, Calendar, FileBarChart, FolderOpen, LayoutDashboard,
  LogOut, Megaphone, MessageCircle, Settings,
  Smile, TrendingUp, User, Users, type LucideIcon,
} from "lucide-react";
import { NotificationBell } from "@/components/layout/notification-bell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  /** Bottom tabs on mobile; defaults to all navItems when omitted */
  mobileNavItems?: NavItem[];
  /** Extra links shown in the mobile profile menu */
  profileMenuItems?: NavItem[];
  children: React.ReactNode;
  userId?: string;
  role?: string;
}

function NavLink({
  item,
  active,
  onClick,
  compact,
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
  compact?: boolean;
}) {
  const { t } = useLanguage();
  const Icon = NAV_ICONS[item.icon];

  if (compact) {
    return (
      <Link
        href={item.href}
        prefetch
        onClick={onClick}
        className={cn(
          "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors",
          active ? "text-primary" : "text-muted-foreground"
        )}
      >
        <Icon className={cn("h-5 w-5 shrink-0", active && "stroke-[2.5]")} />
        <span className="max-w-full truncate leading-tight">{t(item.labelKey)}</span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      prefetch
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {t(item.labelKey)}
    </Link>
  );
}

export function PortalShell({
  titleKey,
  subtitle,
  navItems,
  mobileNavItems,
  profileMenuItems = [],
  children,
  userId,
  role,
}: PortalShellProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const title = t(titleKey);
  const bottomTabs = mobileNavItems ?? navItems;

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  const profileActive = profileMenuItems.some((item) => isActive(item.href));

  const sidebar = (
    <aside className="relative flex h-full w-64 shrink-0 flex-col border-e border-border bg-card lg:h-dvh">
      <div className="hidden h-0 shrink-0 pt-safe lg:block" />

      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="SafeVoice" width={32} height={32} className="rounded-xl" />
          <div>
            <p className="text-sm font-bold leading-tight">SafeVoice</p>
            <p className="text-[10px] leading-tight text-muted-foreground">{title}</p>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          {userId && <NotificationBell userId={userId} role={role} />}
        </div>
      </div>

      {subtitle && (
        <div className="border-b border-border/50 px-4 py-2">
          <p className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{subtitle}</p>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </div>
      </nav>

      <div className="border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-1.5">
          <LanguageToggle />
          <ThemeToggle />
          <form action={signOut} className="flex-1">
            <Button
              variant="ghost"
              size="sm"
              type="submit"
              className="w-full justify-start gap-2 rounded-xl text-muted-foreground hover:text-foreground"
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
    <div className="flex h-dvh overflow-hidden bg-background">
      <div className="order-1 hidden lg:flex rtl:order-2">{sidebar}</div>

      <div className="order-2 flex min-w-0 flex-1 flex-col overflow-hidden rtl:order-1">
        <header className="relative shrink-0 border-b border-border bg-card lg:hidden">
          <div className="pt-safe" />
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex min-w-0 items-center gap-2">
              <Image src="/logo.png" alt="SafeVoice" width={28} height={28} className="shrink-0 rounded-lg" />
              <span className="truncate text-sm font-semibold">{title}</span>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <LanguageToggle />
              {userId && <NotificationBell userId={userId} role={role} />}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("rounded-xl", profileActive && "text-primary")}
                    aria-label={t("nav.profile")}
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {profileMenuItems.map((item) => {
                    const Icon = NAV_ICONS[item.icon];
                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="flex w-full items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {t(item.labelKey)}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                  {profileMenuItems.length > 0 && <DropdownMenuSeparator />}
                  <div className="flex items-center gap-1 px-2 py-1.5">
                    <span className="flex-1 text-xs text-muted-foreground">{t("theme.toggle")}</span>
                    <ThemeToggle />
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <form action={signOut} className="w-full">
                      <button type="submit" className="flex w-full items-center gap-2 text-sm">
                        <LogOut className="h-4 w-4" />
                        {t("common.signOut")}
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto p-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:p-6 lg:pb-[max(1rem,env(safe-area-inset-bottom))]">
          {children}
        </main>

        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm lg:hidden"
          aria-label={t("nav.mainNavigation")}
        >
          <div className="pb-safe" />
          <div className="flex h-14 items-stretch">
            {bottomTabs.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(item.href)} compact />
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
