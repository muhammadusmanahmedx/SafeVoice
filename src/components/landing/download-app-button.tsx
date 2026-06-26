"use client";

import { useState } from "react";
import { Download, Plus, Share, MoreVertical } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type DownloadAppButtonProps = {
  label?: string;
  variant?: "hero" | "cta";
  className?: string;
};

export function DownloadAppButton({ label, variant = "hero", className }: DownloadAppButtonProps) {
  const { t } = useLanguage();
  const { canInstall, canNativeInstall, isIos, promptInstall } = usePwaInstall();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!canInstall) return null;

  const text = label ?? t("landing.hero.downloadApp");

  async function handleClick() {
    if (canNativeInstall) {
      const accepted = await promptInstall();
      if (!accepted) setDialogOpen(true);
      return;
    }
    setDialogOpen(true);
  }

  const iosSteps = [
    { icon: Share, text: t("pwa.iosStep1") },
    { icon: Plus, text: t("pwa.iosStep2") },
    { icon: Download, text: t("pwa.iosStep3") },
  ];

  const androidSteps = [
    { icon: MoreVertical, text: t("pwa.androidStep1") },
    { icon: Download, text: t("pwa.androidStep2") },
  ];

  const steps = isIos ? iosSteps : androidSteps;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold transition-all",
          variant === "hero" &&
            "border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20",
          variant === "cta" &&
            "border border-[#a38016]/40 bg-[#a38016]/15 text-white hover:bg-[#a38016]/25",
          className
        )}
      >
        <Download className="h-4 w-4" />
        {text}
      </button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("pwa.installTitle")}</DialogTitle>
            <DialogDescription>
              {isIos ? t("pwa.installIosIntro") : t("pwa.installAndroidIntro")}
            </DialogDescription>
          </DialogHeader>
          <ol className="space-y-3">
            {steps.map((step, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <step.icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm text-foreground">{step.text}</span>
              </li>
            ))}
          </ol>
        </DialogContent>
      </Dialog>
    </>
  );
}
