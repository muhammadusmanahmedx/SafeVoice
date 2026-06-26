"use client";

import { useEffect } from "react";
import { App } from "@capacitor/app";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";
import { isNativeApp } from "@/lib/capacitor/is-native";

export function NativeShellInit() {
  useEffect(() => {
    if (!isNativeApp()) return;

    void (async () => {
      try {
        // White icons on both platforms
        await StatusBar.setStyle({ style: Style.Light });

        // setBackgroundColor is Android-only — safe to ignore on iOS
        if (Capacitor.getPlatform() === "android") {
          await StatusBar.setBackgroundColor({ color: "#193852" });
        }

        // Ensure the WebView is NOT covered by the status bar overlay.
        // overlaysWebView: false in config handles it, but call again at runtime for safety.
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch {
        // StatusBar plugin unavailable (e.g. web preview)
      }

      try {
        await SplashScreen.hide();
      } catch {
        // ignore
      }
    })();

    // Android hardware back button
    const backListenerPromise = App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        void App.exitApp();
      }
    });

    return () => {
      void backListenerPromise.then((l) => l.remove());
    };
  }, []);

  return null;
}
