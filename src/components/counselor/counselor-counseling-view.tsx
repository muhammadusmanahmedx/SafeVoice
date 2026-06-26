"use client";

import Link from "next/link";
import { WeeklyHoursEditor } from "@/components/counselor/weekly-hours-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/components/providers/language-provider";
import { formatMessage } from "@/lib/i18n/labels";
import { canJoinSession, formatSessionDay } from "@/lib/counseling/meeting-access";
import { Calendar, User, Video } from "lucide-react";

interface CounselorCounselingViewProps {
  upcomingBookings: {
    id: string;
    topic: string | null;
    studentName: string;
    slotAt: string;
    durationMinutes: number;
  }[];
  weeklyRows: { day_of_week: number; start_time: string; end_time: string }[];
  initialDuration: number;
  timeZone: string;
}

export function CounselorCounselingView({
  upcomingBookings,
  weeklyRows,
  initialDuration,
  timeZone,
}: CounselorCounselingViewProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("counselor.counseling.pageTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("counselor.counseling.pageSubtitle")}</p>
      </div>

      <Tabs defaultValue="bookings">
        <TabsList>
          <TabsTrigger value="bookings">
            {t("counselor.counseling.studentBookings")}
            {upcomingBookings.length > 0 && (
              <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                {upcomingBookings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="availability">{t("counselor.counseling.weeklyHours")}</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="mt-6 space-y-3">
          {upcomingBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("counselor.counseling.noUpcoming")}</p>
          ) : (
            upcomingBookings.map((booking) => {
              const joinable = canJoinSession(booking.slotAt, booking.durationMinutes, undefined, timeZone);
              return (
                <div
                  key={booking.id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{booking.studentName || t("common.studentDefaultName")}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.slotAt).toLocaleString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {" · "}
                        {formatMessage(t("common.minSession"), { minutes: booking.durationMinutes })}
                      </p>
                      {booking.topic && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t("common.topic")}: {booking.topic}
                        </p>
                      )}
                      {!joinable && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatMessage(t("counselor.counseling.joinAvailableOn"), {
                            date: formatSessionDay(booking.slotAt, timeZone),
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {joinable ? (
                      <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        <Link href={`/counselor/counseling/meeting/${booking.id}`}>
                          <Video className="mr-1.5 h-3.5 w-3.5" />
                          {t("common.joinSession")}
                        </Link>
                      </Button>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <User className="h-3 w-3" />
                        {t("common.booked")}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="availability" className="mt-6">
          <WeeklyHoursEditor
            initialRows={weeklyRows}
            initialDuration={initialDuration}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
