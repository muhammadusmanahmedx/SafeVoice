"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createAnnouncement, deleteAnnouncement } from "@/lib/actions/admin";
import { formatDate } from "@/lib/utils";

interface AnnouncementsManagerProps {
  announcements: {
    id: string;
    title: string;
    content: string;
    published_at: string;
  }[];
}

export function AnnouncementsManager({ announcements }: AnnouncementsManagerProps) {
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
        <h2 className="font-semibold">Publish Announcement</h2>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
        </div>
        <Button onClick={handleCreate} disabled={loading}>
          {loading ? "Publishing..." : "Publish to Faculty"}
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
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
        {announcements.length === 0 && (
          <p className="text-sm text-muted-foreground">No announcements yet.</p>
        )}
      </div>
    </div>
  );
}
