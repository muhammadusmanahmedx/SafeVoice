import { isNativeApp } from "@/lib/capacitor/is-native";

/**
 * Hard-navigates to `url` after sign in / sign up.
 *
 * In the Capacitor Android WebView the Supabase auth cookie set by the server
 * action is written to the cookie store asynchronously. Navigating immediately
 * can race ahead of that write, so the next request arrives without the cookie
 * and middleware bounces the user back to /login (it only "worked" after an app
 * restart because the cookie was flushed to disk on pause).
 *
 * Giving the WebView a short tick to commit the cookie before the hard
 * navigation reliably fixes the redirect. On the web this delay is negligible.
 */
export function navigateAfterAuth(url: string): void {
  const delay = isNativeApp() ? 700 : 0;
  window.setTimeout(() => {
    window.location.href = url;
  }, delay);
}
