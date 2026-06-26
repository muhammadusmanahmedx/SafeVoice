"use client";

import Link from "next/link";
import Image from "next/image";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { useLanguage } from "@/components/providers/language-provider";

export function PublicHeader() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-5 z-50 mx-auto max-w-6xl px-6">
      <div className="flex h-[68px] items-center justify-between rounded-2xl border border-white/60 bg-white/90 px-6 shadow-sm backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="SafeVoice" width={36} height={36} className="rounded-xl" />
          <span className="text-sm font-bold tracking-tight text-[#0d0d0d]">SafeVoice</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle className="text-[#0d0d0d] hover:bg-gray-100" />
          <Link
            href="/login"
            className="hidden rounded-xl px-5 py-2 text-sm font-semibold text-[#0d0d0d] transition-colors hover:bg-gray-100 sm:block"
          >
            {t("home.signIn")}
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-[#a38016] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {t("home.getStarted")}
          </Link>
        </div>
      </div>
    </header>
  );
}
