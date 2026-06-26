"use client";

import { AnnouncementsManager } from "@/components/admin/announcements-manager";
import { useLanguage } from "@/components/providers/language-provider";

interface AdminAnnouncementsViewProps {
  announcements: {
    id: string;
    title: string;
    content: string;
    published_at: string;
  }[];
}

export function AdminAnnouncementsView({ announcements }: AdminAnnouncementsViewProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("admin.announcements.pageTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.announcements.pageSubtitle")}</p>
      </div>
      <AnnouncementsManager announcements={announcements} />
    </div>
  );
}
