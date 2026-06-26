"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";

interface StudentMeetingErrorViewProps {
  messageKey: string;
}

export function StudentMeetingErrorView({ messageKey }: StudentMeetingErrorViewProps) {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <p className="text-muted-foreground">{t(messageKey)}</p>
      <Button asChild variant="outline">
        <Link href="/counseling">{t("common.back")}</Link>
      </Button>
    </div>
  );
}
