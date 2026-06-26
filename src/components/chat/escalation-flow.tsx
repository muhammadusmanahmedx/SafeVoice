"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCaseFromEscalation } from "@/lib/actions/cases";
import { useLanguage } from "@/components/providers/language-provider";
import { getIncidentTypeLabel, getRiskLevelLabel } from "@/lib/i18n/labels";
import type { EscalationData, RiskAssessment } from "@/types";
import { ShieldCheck, UserCheck, UserX, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EscalationFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  assessment: RiskAssessment;
}

export function EscalationFlow({ open, onOpenChange, conversationId, assessment }: EscalationFlowProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [identityChoice, setIdentityChoice] = useState<"anonymous" | "identified" | null>(null);
  const [form, setForm] = useState<EscalationData>({
    location: "",
    duration: "",
    peopleInvolved: "unknown",
    othersAffected: false,
  });

  async function handleSubmit() {
    setLoading(true);
    const result = await createCaseFromEscalation(
      conversationId,
      form,
      assessment.summary,
      assessment.category,
      assessment.riskLevel,
      identityChoice === "identified"
    );
    setLoading(false);
    if (!result.error) setStep(4);
  }

  function handleClose() {
    setStep(0);
    setIdentityChoice(null);
    setForm({ location: "", duration: "", peopleInvolved: "unknown", othersAffected: false });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">

        {/* Step 0 — Offer support */}
        {step === 0 && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                {t("student.chat.escalation.offerTitle")}
              </DialogTitle>
              <DialogDescription>
                {t("student.chat.escalation.offerDescription")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose}>{t("student.chat.escalation.notNow")}</Button>
              <Button onClick={() => setStep(1)}>{t("student.chat.escalation.yesNotify")}</Button>
            </DialogFooter>
          </>
        )}

        {/* Step 1 — Identity choice */}
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>{t("student.chat.escalation.identityTitle")}</DialogTitle>
              <DialogDescription>
                {t("student.chat.escalation.identityDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <button
                onClick={() => setIdentityChoice("anonymous")}
                className={cn(
                  "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors",
                  identityChoice === "anonymous"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                )}
              >
                <UserX className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-semibold text-sm">{t("student.chat.escalation.stayAnonymous")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("student.chat.escalation.stayAnonymousDesc")}
                  </p>
                </div>
              </button>
              <button
                onClick={() => setIdentityChoice("identified")}
                className={cn(
                  "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors",
                  identityChoice === "identified"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                )}
              >
                <UserCheck className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-semibold text-sm">{t("student.chat.escalation.shareIdentity")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("student.chat.escalation.shareIdentityDesc")}
                  </p>
                </div>
              </button>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep(0)}>{t("common.back")}</Button>
              <Button onClick={() => setStep(2)} disabled={!identityChoice}>{t("common.confirm")}</Button>
            </DialogFooter>
          </>
        )}

        {/* Step 2 — Incident details */}
        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle>{t("student.chat.escalation.detailsTitle")}</DialogTitle>
              <DialogDescription>
                {t("student.chat.escalation.detailsDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-sm">{t("student.chat.escalation.whereHappening")}</Label>
                <Input
                  placeholder={t("student.chat.escalation.wherePlaceholder")}
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">{t("student.chat.escalation.howLong")}</Label>
                <Input
                  placeholder={t("student.chat.escalation.howLongPlaceholder")}
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">{t("student.chat.escalation.whoInvolved")}</Label>
                <Select
                  value={form.peopleInvolved}
                  onValueChange={(v) => setForm({ ...form, peopleInvolved: v as EscalationData["peopleInvolved"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">{t("student.chat.escalation.peopleStudent")}</SelectItem>
                    <SelectItem value="faculty">{t("student.chat.escalation.peopleFaculty")}</SelectItem>
                    <SelectItem value="group">{t("student.chat.escalation.peopleGroup")}</SelectItem>
                    <SelectItem value="unknown">{t("student.chat.escalation.peopleUnknown")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">{t("student.chat.escalation.othersAffected")}</Label>
                <Select
                  value={form.othersAffected ? "yes" : "no"}
                  onValueChange={(v) => setForm({ ...form, othersAffected: v === "yes" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">{t("common.yes")}</SelectItem>
                    <SelectItem value="no">{t("student.chat.escalation.othersAffectedNo")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>{t("common.back")}</Button>
              <Button onClick={() => setStep(3)} disabled={!form.location}>
                {t("student.chat.escalation.preview")}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 3 — Preview & confirm */}
        {step === 3 && (
          <>
            <DialogHeader>
              <DialogTitle>{t("student.chat.escalation.reviewTitle")}</DialogTitle>
              <DialogDescription>
                {t("student.chat.escalation.reviewDescriptionPrefix")}{" "}
                <span className="font-medium text-foreground">
                  {identityChoice === "anonymous"
                    ? t("student.chat.escalation.reviewDescriptionAnonymousWord")
                    : t("student.chat.escalation.reviewDescriptionIdentifiedWord")}
                </span>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 rounded-xl bg-muted/60 p-4 text-sm">
              <Row label={t("common.type")} value={getIncidentTypeLabel(t, assessment.category)} />
              <Row label={t("common.severity")} value={getRiskLevelLabel(t, assessment.riskLevel)} />
              <Row label={t("common.summary")} value={assessment.summary} />
              <Row label={t("common.location")} value={form.location} />
              {form.duration && <Row label={t("common.duration")} value={form.duration} />}
              <Row
                label={t("common.identity")}
                value={identityChoice === "anonymous" ? t("common.anonymous") : t("common.shared")}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>{t("common.back")}</Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading
                  ? t("student.chat.escalation.submitting")
                  : identityChoice === "anonymous"
                    ? t("student.chat.escalation.submitAnonymously")
                    : t("student.chat.escalation.submitWithIdentity")}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Step 4 — Submitted */}
        {step === 4 && (
          <>
            <DialogHeader>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <DialogTitle className="text-center">{t("student.chat.escalation.submittedTitle")}</DialogTitle>
              <DialogDescription className="text-center">
                {t("student.chat.escalation.submittedDescription")}
                {identityChoice === "anonymous"
                  ? t("student.chat.escalation.submittedAnonymousNote")
                  : t("student.chat.escalation.submittedIdentifiedNote")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button className="w-full" onClick={handleClose}>{t("common.done")}</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-20 shrink-0 font-medium capitalize">{label}:</span>
      <span className="text-muted-foreground capitalize">{value}</span>
    </div>
  );
}
