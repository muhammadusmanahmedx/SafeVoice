"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createAnnouncement, deleteAnnouncement } from "@/lib/actions/admin";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";

interface AnnouncementsManagerProps {
  announcements: {
    id: string;
    title: string;
    content: string;
    published_at: string;
  }[];
}

export function AnnouncementsManager({ announcements }: AnnouncementsManagerProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    await createAnnouncement(title, content);
    setTitle("");
    setContent("");
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <div className="glass-card space-y-4 p-6">
        <h2 className="font-semibold">{t("admin.announcements.publishTitle")}</h2>
        <div className="space-y-2">
          <Label htmlFor="title">{t("common.title")}</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">{t("common.content")}</Label>
          <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
        </div>
        <Button onClick={handleCreate} disabled={loading}>
          {loading ? t("admin.announcements.publishing") : t("admin.announcements.publishToCounselors")}
        </Button>
      </div>

      <div className="space-y-3">
        {announcements.map((a) => (
          <Card key={a.id}>
            <CardContent className="flex items-start justify-between p-4">
              <div>
                <p className="font-medium">{a.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{a.content}</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDate(a.published_at)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => deleteAnnouncement(a.id)}>
                {t("common.delete")}
              </Button>
            </CardContent>
          </Card>
        ))}
        {announcements.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("admin.announcements.empty")}</p>
        )}
      </div>
    </div>
  );
}
