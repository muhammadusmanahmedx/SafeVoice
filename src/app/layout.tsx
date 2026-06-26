import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Arabic, Noto_Sans_Devanagari } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { InstallPrompt } from "@/components/layout/install-prompt";
import { NativeShellInit } from "@/components/layout/native-shell-init";
import { StatusBarBackdrop } from "@/components/layout/status-bar-backdrop";
import { LanguageProvider } from "@/components/providers/language-provider";
import { TimezoneCookie } from "@/components/timezone-cookie";
import { LOCALE_COOKIE } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const notoArabic = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-arabic" });
const notoHindi = Noto_Sans_Devanagari({ subsets: ["devanagari"], variable: "--font-hindi" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#193852",
};

export const metadata: Metadata = {
  title: "SafeVoice — Student Wellbeing Platform",
  description: "Giving students a voice before silence becomes a crisis",
  applicationName: "SafeVoice",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    // black-translucent: status bar becomes transparent so our navy header
    // fills behind it; safe-area-inset-top padding keeps text clear of it.
    statusBarStyle: "black-translucent",
    title: "SafeVoice",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoArabic.variable} ${notoHindi.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var tz=Intl.DateTimeFormat().resolvedOptions().timeZone;document.cookie="user-timezone="+encodeURIComponent(tz)+";path=/;max-age=31536000;SameSite=Lax";var m=document.cookie.match(/(?:^|;\\s*)${LOCALE_COOKIE}=([^;]*)/);var lang=m?decodeURIComponent(m[1]):"en";if(["en","ar","hi"].indexOf(lang)===-1)lang="en";document.documentElement.lang=lang;document.documentElement.dir=lang==="ar"?"rtl":"ltr";}catch(e){}})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform())return;window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__pwaInstallPrompt=e;window.dispatchEvent(new Event("pwa:install-available"));});window.addEventListener("appinstalled",function(){window.__pwaInstallPrompt=null;window.dispatchEvent(new Event("pwa:installed"));});})();`,
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="light" themes={["light", "dark", "calm"]}>
          <LanguageProvider>
            <StatusBarBackdrop />
            <NativeShellInit />
            <TimezoneCookie />
            {children}
            <InstallPrompt />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
