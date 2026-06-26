"use client";

import { Calendar } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { CounselingBookingPanel } from "@/components/student/counseling-booking";
import type { WeeklyAvailabilityRange } from "@/lib/counseling/availability-frames";
import type { CounselingBooking, CounselingSlot } from "@/components/student/counseling-booking";

interface CounselingPageViewProps {
  availableSlots: CounselingSlot[];
  weeklyRanges: WeeklyAvailabilityRange[];
  myBookings: CounselingBooking[];
}

export function CounselingPageView({
  availableSlots,
  weeklyRanges,
  myBookings,
}: CounselingPageViewProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
          <Calendar className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("student.counseling.pageTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("student.counseling.pageSubtitle")}</p>
        </div>
      </div>

      <CounselingBookingPanel
        availableSlots={availableSlots}
        weeklyRanges={weeklyRanges}
        myBookings={myBookings}
      />
    </div>
  );
}
