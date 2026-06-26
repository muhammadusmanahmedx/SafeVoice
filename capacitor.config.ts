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
          androidScheme: "https",
        },
      }
    : {
        server: {
          androidScheme: "https",
        },
      }),
  ios: {
    scrollEnabled: true,
    contentInset: "automatic",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1500,
      backgroundColor: "#193852",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
    },
    StatusBar: {
      // "DARK" = white icons on the navy (#193852) status bar
      backgroundColor: "#193852",
      style: "DARK",
      overlaysWebView: false,
    },
  },
};

export default config;
