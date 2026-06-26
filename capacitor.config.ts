import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
  appId: "com.safevoice.app",
  appName: "SafeVoice",
  webDir: "public",
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          // Allow cleartext only for local dev (http://); production must be HTTPS
          cleartext: serverUrl.startsWith("http://"),
          // Android: use the native cookie manager so Supabase session cookies persist
          androidScheme: "https",
        },
      }
    : {
        server: {
          androidScheme: "https",
        },
      }),
  ios: {
    // Allows Jitsi video to play inline in WKWebView without going full-screen
    allowsInlineMediaPlayback: true,
    // Scroll elasticity (bounce) off — feels more native
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: false,
  },
  android: {
    // Let the WebView resize when the soft keyboard appears (fixes chat input)
    adjustModeValue: "ADJUST_RESIZE",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#193852",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      // iOS uses LaunchScreen storyboard
    },
    StatusBar: {
      // Navy bar, white text/icons — applies on both Android & iOS
      backgroundColor: "#193852",
      style: "LIGHT",
      overlaysWebView: false,
    },
    Keyboard: {
      // iOS: push content up when keyboard appears (same as Android adjustResize)
      resize: "body",
      resizeOnFullScreen: true,
    },
  },
};

export default config;
