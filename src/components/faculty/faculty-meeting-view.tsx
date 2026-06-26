"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MeetingAccessGate } from "@/components/counseling/meeting-access-gate";
import { useLanguage } from "@/components/providers/language-provider";

interface FacultyMeetingViewProps {
  bookingId: string;
  slotAt: string;
  durationMinutes: number;
  notFound?: boolean;
  cancelled?: boolean;
}

export function FacultyMeetingView({
  bookingId,
  slotAt,
  durationMinutes,
  notFound,
  cancelled,
}: FacultyMeetingViewProps) {
  const { t } = useLanguage();

  if (notFound || cancelled) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">
          {notFound ? t("common.notFound") : t("student.counseling.cancelTitle")}
        </p>
        <Button asChild variant="outline">
          <Link href="/faculty/counseling">{t("common.back")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <MeetingAccessGate
      bookingId={bookingId}
      backHref="/faculty/counseling"
      slotAt={slotAt}
      durationMinutes={durationMinutes}
    />
  );
}
