"use client";

import { useLanguage } from "@/components/providers/language-provider";

export function ChatPageHeader() {
  const { t } = useLanguage();

  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight">{t("student.chat.pageTitle")}</h1>
      <p className="text-sm text-muted-foreground">{t("student.chat.pageSubtitle")}</p>
    </div>
  );
}
