"use client";

import { Phone, ExternalLink, Building2, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

export interface CrisisResource {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string | null;
  content: string | null;
}

interface CrisisResourcesPanelProps {
  resources: CrisisResource[];
  riskLevel: string;
  className?: string;
}

export function CrisisResourcesPanel({ resources, riskLevel, className }: CrisisResourcesPanelProps) {
  const { t } = useLanguage();

  if (resources.length === 0) return null;

  const isCritical = riskLevel === "critical";

  return (
    <div
      className={cn(
        "mx-auto max-w-2xl rounded-xl border p-4 animate-fade-in",
        isCritical
          ? "border-risk-critical/40 bg-risk-critical/10"
          : "border-risk-high/40 bg-risk-high/10",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle
          className={cn("h-4 w-4 shrink-0", isCritical ? "text-risk-critical" : "text-risk-high")}
        />
        <p className="text-sm font-semibold">
          {isCritical ? t("student.chat.crisis.criticalTitle") : t("student.chat.crisis.highTitle")}
        </p>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        {t("student.chat.crisis.description")}
      </p>
      <div className="space-y-2">
        {resources.map((r) => (
          <div
            key={r.id}
            className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/80 p-3"
          >
            <div className="mt-0.5 shrink-0">
              {r.type === "helpline" ? (
                <Phone className="h-4 w-4 text-primary" />
              ) : (
                <Building2 className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{r.title}</p>
              {(r.description || r.content) && (
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                  {r.description ?? r.content}
                </p>
              )}
              {r.url && (
                <a
                  href={r.url}
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  target={r.url.startsWith("http") ? "_blank" : undefined}
                  rel={r.url.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  {r.type === "helpline" ? t("student.chat.crisis.callNow") : t("student.chat.crisis.visit")}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
