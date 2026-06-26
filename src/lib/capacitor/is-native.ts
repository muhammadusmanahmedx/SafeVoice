import { Capacitor } from "@capacitor/core";

/** True when running inside the Capacitor native shell (iOS/Android app). */
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  return Capacitor.isNativePlatform();
}
