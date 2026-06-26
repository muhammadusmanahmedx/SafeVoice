"use client";

import { useEffect } from "react";
import { App } from "@capacitor/app";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";
import { isNativeApp } from "@/lib/capacitor/is-native";

async function hideSplash() {
  try {
    await SplashScreen.hide();
  } catch {
    // ignore
  }
}

export function NativeShellInit() {
  useEffect(() => {
    if (!isNativeApp()) return;

    const platform = Capacitor.getPlatform();

    void hideSplash();
    const splashFallback = window.setTimeout(() => {
      void hideSplash();
    }, 2500);

    void (async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });

        if (platform === "android") {
          await StatusBar.setBackgroundColor({ color: "#193852" });
          await StatusBar.setOverlaysWebView({ overlay: false });
        } else if (platform === "ios") {
          await StatusBar.setOverlaysWebView({ overlay: true });
        }
      } catch {
        // StatusBar plugin unavailable
      }

      await hideSplash();
    })();

    const backListenerPromise = App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        void App.exitApp();
      }
    });

    return () => {
      window.clearTimeout(splashFallback);
      void backListenerPromise.then((l) => l.remove());
    };
  }, []);

  return null;
}
