import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { TimezoneCookie } from "@/components/timezone-cookie";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "SafeVoice — Student Wellbeing Platform",
  description: "Giving students a voice before silence becomes a crisis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var tz=Intl.DateTimeFormat().resolvedOptions().timeZone;document.cookie="user-timezone="+encodeURIComponent(tz)+";path=/;max-age=31536000;SameSite=Lax"}catch(e){}})();`,
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="light" themes={["light", "dark", "calm"]}>
          <TimezoneCookie />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
