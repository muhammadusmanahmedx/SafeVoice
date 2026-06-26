"use client";

import { useCallback, useEffect, useState } from "react";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __pwaInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

export function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function isIos() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua);
}

export function isAndroid() {
  if (typeof window === "undefined") return false;
  return /Android/.test(window.navigator.userAgent);
}

export function usePwaInstall() {
  const [hasPrompt, setHasPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [ios, setIos] = useState(false);
  const [android, setAndroid] = useState(false);

  useEffect(() => {
    setIsStandalone(isStandaloneMode());
    setIos(isIos());
    setAndroid(isAndroid());

    // The event may have already been captured by the early inline script in layout.
    if (typeof window !== "undefined" && window.__pwaInstallPrompt) {
      setHasPrompt(true);
    }

    function handleAvailable() {
      setHasPrompt(true);
    }
    function handleInstalled() {
      setHasPrompt(false);
      setIsStandalone(true);
    }
    // Fallback in case this hook mounts before the event fires.
    function handleBeforeInstall(event: Event) {
      event.preventDefault();
      window.__pwaInstallPrompt = event as BeforeInstallPromptEvent;
      setHasPrompt(true);
    }

    window.addEventListener("pwa:install-available", handleAvailable);
    window.addEventListener("pwa:installed", handleInstalled);
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => {
      window.removeEventListener("pwa:install-available", handleAvailable);
      window.removeEventListener("pwa:installed", handleInstalled);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    const evt = typeof window !== "undefined" ? window.__pwaInstallPrompt : null;
    if (!evt) return false;
    await evt.prompt();
    const { outcome } = await evt.userChoice;
    window.__pwaInstallPrompt = null;
    setHasPrompt(false);
    return outcome === "accepted";
  }, []);

  return {
    canInstall: !isStandalone,
    canNativeInstall: hasPrompt,
    isIos: ios,
    isAndroid: android,
    isStandalone,
    promptInstall,
  };
}
