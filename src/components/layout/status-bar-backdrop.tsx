"use client";

import { useEffect, useState } from "react";
import { isNativeApp } from "@/lib/capacitor/is-native";

/**
 * Paints a navy strip behind the device status bar so the white status-bar
 * icons stay legible on every screen.
 *
 * - iOS: the status bar floats over the WebView (edge-to-edge), so without this
 *   the icons would sit on top of whatever the page background is (e.g. a white
 *   login screen → invisible). Height tracks `safe-area-inset-top` (notch /
 *   Dynamic Island aware).
 * - Android: the status bar reserves its own space (overlay off), so
 *   `safe-area-inset-top` is 0 and this strip is harmlessly zero-height.
 */
export function StatusBarBackdrop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(isNativeApp());
  }, []);

  if (!show) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[2147483647] bg-[#193852]"
      style={{ height: "env(safe-area-inset-top, 0px)" }}
    />
  );
}
