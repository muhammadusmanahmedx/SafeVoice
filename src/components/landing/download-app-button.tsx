"use client";

import { useState } from "react";
import { Download, Share, Smartphone } from "lucide-react";
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
      await promptInstall();
      return;
    }
    setDialogOpen(true);
  }

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
            <DialogDescription asChild>
              <div className="space-y-4 pt-2 text-sm text-muted-foreground">
                {isIos ? (
                  <p className="flex items-start gap-3">
                    <Share className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span>{t("pwa.installIos")}</span>
                  </p>
                ) : (
                  <>
                    <p className="flex items-start gap-3">
                      <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span>{t("pwa.installMobileHint")}</span>
                    </p>
                    <p>{t("pwa.installDesktopHint")}</p>
                  </>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
