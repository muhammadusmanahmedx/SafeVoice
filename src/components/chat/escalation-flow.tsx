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
                Additional Support Available
              </DialogTitle>
              <DialogDescription>
                It sounds like this situation may benefit from faculty support. Would you like to notify
                a faculty member who can help?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose}>Not now</Button>
              <Button onClick={() => setStep(1)}>Yes, notify faculty</Button>
            </DialogFooter>
          </>
        )}

        {/* Step 1 — Identity choice */}
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>How would you like to report?</DialogTitle>
              <DialogDescription>
                You are always in control. Faculty cannot see your identity unless you choose to share it.
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
                  <p className="font-semibold text-sm">Stay anonymous</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Faculty sees the report but not your name. You stay hidden unless you choose later.
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
                  <p className="font-semibold text-sm">Share my identity</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Faculty will know this report is from you — enables more personalised support.
                  </p>
                </div>
              </button>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
              <Button onClick={() => setStep(2)} disabled={!identityChoice}>Continue</Button>
            </DialogFooter>
          </>
        )}

        {/* Step 2 — Incident details */}
        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle>Incident Details</DialogTitle>
              <DialogDescription>
                Share what you&apos;re comfortable with. All fields except location are optional.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-sm">Where is this happening?</Label>
                <Input
                  placeholder="e.g. Classroom, Hallway, Online"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">How long has this been happening?</Label>
                <Input
                  placeholder="e.g. Two weeks, Since September"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Who is involved?</Label>
                <Select
                  value={form.peopleInvolved}
                  onValueChange={(v) => setForm({ ...form, peopleInvolved: v as EscalationData["peopleInvolved"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="group">Group</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Does this affect other students?</Label>
                <Select
                  value={form.othersAffected ? "yes" : "no"}
                  onValueChange={(v) => setForm({ ...form, othersAffected: v === "yes" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No / Unsure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)} disabled={!form.location}>Preview</Button>
            </DialogFooter>
          </>
        )}

        {/* Step 3 — Preview & confirm */}
        {step === 3 && (
          <>
            <DialogHeader>
              <DialogTitle>Review Your Report</DialogTitle>
              <DialogDescription>
                This will be submitted{" "}
                <span className="font-medium text-foreground">
                  {identityChoice === "anonymous" ? "anonymously" : "with your identity"}
                </span>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 rounded-xl bg-muted/60 p-4 text-sm">
              <Row label="Type" value={assessment.category.replace("_", " ")} />
              <Row label="Severity" value={assessment.riskLevel} />
              <Row label="Summary" value={assessment.summary} />
              <Row label="Location" value={form.location} />
              {form.duration && <Row label="Duration" value={form.duration} />}
              <Row label="Identity" value={identityChoice === "anonymous" ? "Anonymous" : "Shared"} />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting…" : identityChoice === "anonymous" ? "Submit Anonymously" : "Submit with Identity"}
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
              <DialogTitle className="text-center">Report Submitted</DialogTitle>
              <DialogDescription className="text-center">
                A faculty member will review your concern shortly.
                Check your Cases page for updates and responses.
                {identityChoice === "anonymous"
                  ? " Your identity remains protected."
                  : " Your name has been shared with the faculty member."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button className="w-full" onClick={handleClose}>Done</Button>
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
