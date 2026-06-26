"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { isNativeApp } from "@/lib/capacitor/is-native";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "safevoice-install-dismissed";

function isMobileDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px)").matches;
}

export function InstallPrompt() {
  const { t } = useLanguage();
  const { canInstall, canNativeInstall, isIos, promptInstall } = usePwaInstall();
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"android" | "ios">("android");

  useEffect(() => {
    if (isNativeApp()) return;
    if (!canInstall || !isMobileDevice()) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    if (isIos) {
      setMode("ios");
      setVisible(true);
      return;
    }

    if (canNativeInstall) {
      setMode("android");
      setVisible(true);
    }
  }, [canInstall, canNativeInstall, isIos]);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  async function handleInstall() {
    const accepted = await promptInstall();
    if (accepted) setVisible(false);
  }

  if (isNativeApp() || !visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 p-4 shadow-lg backdrop-blur-sm",
        "pb-[max(1rem,env(safe-area-inset-bottom))]"
      )}
      role="region"
      aria-label={t("pwa.installTitle")}
    >
      <div className="mx-auto flex max-w-lg items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          {mode === "android" ? <Download className="h-5 w-5" /> : <Share className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{t("pwa.installTitle")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {mode === "android" ? t("pwa.installAndroid") : t("pwa.installIos")}
          </p>
          <div className="mt-3 flex gap-2">
            {mode === "android" && canNativeInstall && (
              <Button size="sm" onClick={handleInstall}>
                {t("pwa.installAction")}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={dismiss}>
              {t("pwa.dismiss")}
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={dismiss}
          aria-label={t("pwa.dismiss")}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
