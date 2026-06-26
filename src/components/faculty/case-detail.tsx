"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  sendCaseMessage, updateCaseStatus, addCaseNote, requestIdentityReveal,
} from "@/lib/actions/case-messages";
import { RISK_LEVEL_COLORS } from "@/types";
import { formatDate, cn } from "@/lib/utils";
import type { CaseStatus } from "@/types";
import { UserX, Clock, CheckCircle2, XCircle, MessageCircle, StickyNote, Shield, User, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import {
  formatMessage,
  getCaseStatusLabel,
  getIncidentTypeLabel,
  getRiskLevelLabel,
} from "@/lib/i18n/labels";

interface RevealRequest {
  id: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  responded_at: string | null;
}

interface FacultyCaseDetailProps {
  caseData: {
    id: string;
    status: CaseStatus;
    summary: string;
    severity: string;
    incident_type: string;
    location: string | null;
    duration: string | null;
    people_involved: string | null;
    others_affected: boolean | null;
    recommended_action: string | null;
    created_at: string;
    identity_revealed?: boolean;
    auto_alerted?: boolean;
  };
  messages: { id: string; sender_role: string; content: string; created_at: string }[];
  notes: { id: string; content: string; created_at: string }[];
  studentInfo?: { display_name: string | null; avatar_url: string | null } | null;
  revealRequests?: RevealRequest[];
}

export function FacultyCaseDetail({ caseData, messages, notes, studentInfo, revealRequests = [] }: FacultyCaseDetailProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [status, setStatus] = useState(caseData.status);
  const [response, setResponse] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [revealRequested, setRevealRequested] = useState(revealRequests.length > 0);
  const [latestReveal, setLatestReveal] = useState<RevealRequest | null>(
    revealRequests.length > 0 ? revealRequests[0] : null
  );

  async function handleStatusChange(newStatus: CaseStatus) {
    setStatus(newStatus);
    await updateCaseStatus(caseData.id, newStatus);
  }

  async function handleRespond() {
    if (!response.trim()) return;
    setLoading(true);
    await sendCaseMessage(caseData.id, response);
    setResponse("");
    setLoading(false);
    router.refresh();
  }

  async function handleAddNote() {
    if (!note.trim()) return;
    await addCaseNote(caseData.id, note);
    setNote("");
    router.refresh();
  }

  async function handleRequestReveal() {
    setLoading(true);
    const result = await requestIdentityReveal(caseData.id);
    setLoading(false);
    if (!result.error) {
      setRevealRequested(true);
      setLatestReveal({
        id: "pending",
        status: "pending",
        created_at: new Date().toISOString(),
        responded_at: null,
      });
    }
  }

  const revealStatus = latestReveal?.status;
  const identityKnown = caseData.identity_revealed && !!studentInfo;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        {caseData.auto_alerted && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-700">{t("faculty.caseDetail.autoAlertTitle")}</p>
              <p className="mt-0.5 text-xs text-amber-600">{t("faculty.caseDetail.autoAlertDesc")}</p>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">
                {getIncidentTypeLabel(t, caseData.incident_type)}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatMessage(t("faculty.caseDetail.submitted"), { date: formatDate(caseData.created_at) })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium",
                RISK_LEVEL_COLORS[caseData.severity as keyof typeof RISK_LEVEL_COLORS]
              )}>
                {getRiskLevelLabel(t, caseData.severity)}
              </span>
              <Select value={status} onValueChange={(v) => handleStatusChange(v as CaseStatus)}>
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["new", "in_progress", "escalated", "resolved", "unsubstantiated"] as CaseStatus[]).map((key) => (
                    <SelectItem key={key} value={key} className="text-xs">{getCaseStatusLabel(t, key)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed">{caseData.summary}</p>

          <div className="mt-4 grid gap-1.5 text-sm sm:grid-cols-2">
            {caseData.location && (
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{t("common.location")}:</span> {caseData.location}
              </p>
            )}
            {caseData.duration && (
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{t("common.duration")}:</span> {caseData.duration}
              </p>
            )}
            {caseData.people_involved && (
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{t("common.people")}:</span> {caseData.people_involved}
              </p>
            )}
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">{t("common.othersAffected")}:</span>{" "}
              {caseData.others_affected ? t("common.yes") : t("common.no")}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">{t("faculty.caseDetail.anonymousMessages")}</h3>
          </div>
          <div className="space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("faculty.caseDetail.noMessages")}</p>
            )}
            {messages.map((msg) => (
              <div key={msg.id}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm",
                  msg.sender_role === "faculty" ? "ml-8 bg-primary/10" : "mr-8 bg-muted"
                )}
              >
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {msg.sender_role}
                </p>
                <p className="leading-relaxed">{msg.content}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{formatDate(msg.created_at)}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder={t("faculty.caseDetail.responsePlaceholder")}
              rows={3}
              className="resize-none text-sm"
            />
            <Button size="sm" onClick={handleRespond} disabled={loading || !response.trim()}>
              {t("faculty.caseDetail.sendResponse")}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">{t("faculty.caseDetail.studentIdentity")}</h3>
          </div>

          {!identityKnown && !revealRequested && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <UserX className="h-4 w-4 shrink-0" />
                <span>{t("faculty.caseDetail.identityAnonymous")}</span>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={handleRequestReveal} disabled={loading}>
                {t("faculty.caseDetail.requestReveal")}
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">{t("faculty.caseDetail.revealConsentHint")}</p>
            </>
          )}

          {identityKnown && (
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/20">
                  {studentInfo?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={studentInfo.avatar_url}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-green-700" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-700">
                    {studentInfo?.display_name ?? t("common.studentDefaultName")}
                  </p>
                  <p className="text-xs text-green-600">{t("faculty.caseDetail.identitySharedConsent")}</p>
                </div>
              </div>
            </div>
          )}

          {!identityKnown && revealRequested && revealStatus === "pending" && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                <p className="text-sm font-medium text-amber-700">{t("faculty.caseDetail.requestSent")}</p>
              </div>
              <p className="mt-1 text-xs text-amber-600">{t("faculty.caseDetail.requestSentDesc")}</p>
              {latestReveal && (
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  {formatMessage(t("faculty.caseDetail.requested"), { date: formatDate(latestReveal.created_at) })}
                </p>
              )}
            </div>
          )}

          {!identityKnown && revealRequested && revealStatus === "accepted" && (
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <p className="text-sm font-medium text-green-700">{t("faculty.caseDetail.identityShared")}</p>
              </div>
              <p className="mt-1 text-xs text-green-600">{t("faculty.caseDetail.identitySharedDesc")}</p>
              {latestReveal?.responded_at && (
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  {formatMessage(t("faculty.caseDetail.accepted"), { date: formatDate(latestReveal.responded_at) })}
                </p>
              )}
            </div>
          )}

          {!identityKnown && revealRequested && revealStatus === "declined" && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-sm font-medium text-destructive">{t("faculty.caseDetail.requestDeclined")}</p>
              </div>
              <p className="mt-1 text-xs text-destructive/80">{t("faculty.caseDetail.requestDeclinedDesc")}</p>
              {latestReveal?.responded_at && (
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  {formatMessage(t("faculty.caseDetail.declined"), { date: formatDate(latestReveal.responded_at) })}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">{t("faculty.caseDetail.internalNotes")}</h3>
          </div>
          <div className="space-y-2 mb-3">
            {notes.length === 0 && (
              <p className="text-xs text-muted-foreground">{t("faculty.caseDetail.noNotes")}</p>
            )}
            {notes.map((n) => (
              <div key={n.id} className="rounded-lg bg-muted p-3 text-xs">
                <p className="leading-relaxed">{n.content}</p>
                <p className="mt-1 text-muted-foreground">{formatDate(n.created_at)}</p>
              </div>
            ))}
          </div>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("faculty.caseDetail.notePlaceholder")}
            rows={2}
            className="resize-none text-xs"
          />
          <Button variant="secondary" size="sm" className="mt-2 w-full" onClick={handleAddNote} disabled={!note.trim()}>
            {t("faculty.caseDetail.addNote")}
          </Button>
        </div>
      </div>
    </div>
  );
}
