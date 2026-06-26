"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";
import { formatMessage } from "@/lib/i18n/labels";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  href?: string;
}

interface Props {
  userId?: string;
  role?: string;
}

export function NotificationBell({ userId, role }: Props) {
  const { locale, t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();
    const id = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, locale]);

  async function fetchNotifications() {
    try {
      const res = await fetch(`/api/notifications?role=${role ?? "student"}`, {
        headers: { "Accept-Language": locale },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications ?? []);
      }
    } catch { /* silent */ }
  }

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-7 w-7">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              {unread > 9 ? t("notifications.unreadOverflow") : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">{t("notifications.title")}</p>
          {unread > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {formatMessage(t("notifications.newCount"), { count: unread })}
            </span>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {t("notifications.empty")}
            </div>
          ) : (
            notifications.map((n) => (
              <a
                key={n.id}
                href={n.href ?? "#"}
                className={cn(
                  "flex gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted",
                  !n.read && "bg-primary/5"
                )}
                onClick={() => {
                  setNotifications((prev) =>
                    prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
                  );
                }}
              >
                <div className={cn(
                  "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                  !n.read ? "bg-primary" : "bg-transparent"
                )} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{n.time}</p>
                </div>
              </a>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
