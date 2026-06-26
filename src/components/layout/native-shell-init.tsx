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

    const platform = Capacitor.getPlatform();

    void (async () => {
      try {
        // "Dark" style = white icons, for our navy (#193852) status bar.
        await StatusBar.setStyle({ style: Style.Dark });

        if (platform === "android") {
          // Android reserves a solid navy bar; WebView sits below it.
          await StatusBar.setBackgroundColor({ color: "#193852" });
          await StatusBar.setOverlaysWebView({ overlay: false });
        } else if (platform === "ios") {
          // iOS always floats the status bar over content; let the WebView go
          // edge-to-edge and our StatusBarBackdrop strip + safe-area padding
          // handle the navy backdrop and spacing.
          await StatusBar.setOverlaysWebView({ overlay: true });
        }
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
