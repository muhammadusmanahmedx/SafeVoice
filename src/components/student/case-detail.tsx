"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendCaseMessage, respondToIdentityReveal } from "@/lib/actions/case-messages";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";
import { getCaseStatusLabel, getIncidentTypeLabel } from "@/lib/i18n/labels";
import type { CaseStatus } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CaseDetailProps {
  caseData: {
    id: string;
    status: CaseStatus;
    summary: string;
    severity: string;
    incident_type: string;
    location: string | null;
    created_at: string;
  };
  messages: { id: string; sender_role: string; content: string; created_at: string }[];
  revealRequest?: { id: string; status: string } | null;
}

export function StudentCaseDetail({ caseData, messages, revealRequest }: CaseDetailProps) {
  const { t } = useLanguage();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [revealOpen, setRevealOpen] = useState(revealRequest?.status === "pending");

  async function handleSend() {
    if (!content.trim()) return;
    setLoading(true);
    await sendCaseMessage(caseData.id, content);
    setContent("");
    setLoading(false);
  }

  async function handleReveal(accept: boolean) {
    if (!revealRequest) return;
    await respondToIdentityReveal(revealRequest.id, accept);
    setRevealOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold capitalize">
            {getIncidentTypeLabel(t, caseData.incident_type)}
          </h2>
          <span className="text-sm capitalize text-muted-foreground">
            {getCaseStatusLabel(t, caseData.status)}
          </span>
        </div>
        <p className="mt-2 text-sm">{caseData.summary}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {caseData.location && `${t("student.cases.detail.locationPrefix")} ${caseData.location} · `}
          {formatDate(caseData.created_at)}
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium">{t("student.cases.detail.messagesTitle")}</h3>
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("student.cases.detail.noMessages")}</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "rounded-2xl p-4 text-sm",
                msg.sender_role === "student" ? "ml-8 bg-primary/10" : "mr-8 bg-muted"
              )}
            >
              <p className="mb-1 text-xs font-medium capitalize text-muted-foreground">
                {msg.sender_role === "faculty"
                  ? t("student.cases.detail.facultyResponse")
                  : t("student.cases.detail.you")}
              </p>
              {msg.content}
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("student.cases.detail.replyPlaceholder")}
          rows={2}
        />
        <Button onClick={handleSend} disabled={loading || !content.trim()}>
          {t("common.send")}
        </Button>
      </div>

      <Dialog open={revealOpen} onOpenChange={setRevealOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("student.cases.detail.revealTitle")}</DialogTitle>
            <DialogDescription>{t("student.cases.detail.revealDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => handleReveal(false)}>
              {t("student.cases.detail.remainAnonymous")}
            </Button>
            <Button onClick={() => handleReveal(true)}>{t("student.cases.detail.shareIdentity")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
