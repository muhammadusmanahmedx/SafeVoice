"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  isBefore,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { bookCounselingSession, cancelCounselingBooking } from "@/lib/actions/counseling";
import { useLanguage } from "@/components/providers/language-provider";
import { canJoinSession, isBookingActive, formatSessionDay } from "@/lib/counseling/meeting-access";
import Link from "next/link";
import {
  formatTimeLabel,
  getFramesForDay,
  type WeeklyAvailabilityRange,
} from "@/lib/counseling/availability-frames";
import { cn } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Video,
} from "lucide-react";

export interface CounselingSlot {
  id: string;
  counselor_id: string;
  counselor_name: string;
  slot_at: string;
  duration_minutes: number;
}

export interface CounselingBooking {
  id: string;
  topic: string | null;
  status: string;
  created_at: string;
  slot: CounselingSlot;
}

interface CounselingBookingPanelProps {
  availableSlots: CounselingSlot[];
  weeklyRanges: WeeklyAvailabilityRange[];
  myBookings: CounselingBooking[];
}

function dateKey(iso: string) {
  return format(new Date(iso), "yyyy-MM-dd");
}

function formatSlotTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export function CounselingBookingPanel({
  availableSlots,
  weeklyRanges,
  myBookings,
}: CounselingBookingPanelProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<CounselingSlot | null>(null);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  const upcoming = myBookings.filter(
    (b) => b.status !== "cancelled" && isBookingActive(b.slot.slot_at)
  );

  const slotsByDate = useMemo(() => {
    const map: Record<string, CounselingSlot[]> = {};
    for (const slot of availableSlots) {
      const key = dateKey(slot.slot_at);
      if (!map[key]) map[key] = [];
      map[key].push(slot);
    }
    for (const key of Object.keys(map)) {
      map[key].sort(
        (a, b) => new Date(a.slot_at).getTime() - new Date(b.slot_at).getTime()
      );
    }
    return map;
  }, [availableSlots]);

  const availableDates = useMemo(() => new Set(Object.keys(slotsByDate)), [slotsByDate]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(viewMonth);
    return eachDayOfInterval({
      start: startOfWeek(monthStart),
      end: endOfWeek(monthEnd),
    });
  }, [viewMonth]);

  const selectedDaySlots = selectedDate
    ? slotsByDate[format(selectedDate, "yyyy-MM-dd")] ?? []
    : [];

  const framesForDay = useMemo(() => {
    if (!selectedDate) return [];
    return getFramesForDay(selectedDate, weeklyRanges, selectedDaySlots);
  }, [selectedDate, weeklyRanges, selectedDaySlots]);

  const selectedFrame = framesForDay.find((f) => f.id === selectedFrameId);
  const frameTimeSlots = selectedFrame?.slots ?? [];

  async function handleBook() {
    if (!selectedSlot) return;
    setLoading(true);
    setError(null);
    const result = await bookCounselingSession(selectedSlot.id, topic);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      setSelectedSlot(null);
      setSelectedFrameId(null);
      setTopic("");
      setSuccess(false);
      router.refresh();
    }, 1500);
  }

  async function handleCancelConfirm() {
    if (!cancelTargetId) return;
    setLoading(true);
    const result = await cancelCounselingBooking(cancelTargetId);
    setLoading(false);
    setCancelTargetId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  function handleDayClick(day: Date) {
    const key = format(day, "yyyy-MM-dd");
    if (!availableDates.has(key) || isBefore(startOfDay(day), startOfDay(today))) return;
    setSelectedDate(day);
    setSelectedFrameId(null);
    setSelectedSlot(null);
    setError(null);
  }

  return (
    <div className="space-y-8">
      {upcoming.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#193852]">
            {t("student.counseling.upcomingSessions")}
          </h2>
          <div className="mt-4 space-y-3">
            {upcoming.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col gap-3 rounded-xl border border-green-500/20 bg-green-500/5 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{booking.slot.counselor_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatSlotTime(booking.slot.slot_at)}
                    </p>
                    {booking.topic && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("common.topic")}: {booking.topic}
                      </p>
                    )}
                    {!canJoinSession(booking.slot.slot_at, booking.slot.duration_minutes) && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("student.counseling.joinAvailableOn").replace(
                          "{date}",
                          formatSessionDay(booking.slot.slot_at)
                        )}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {canJoinSession(booking.slot.slot_at, booking.slot.duration_minutes) && (
                    <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      <Link href={`/counseling/meeting/${booking.id}`}>
                        <Video className="mr-1.5 h-3.5 w-3.5" />
                        {t("common.joinSession")}
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCancelTargetId(booking.id)}
                    disabled={loading}
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" />
                    {t("common.cancel")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {availableSlots.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <CalendarIcon className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm font-medium">{t("student.counseling.noAvailabilityTitle")}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("student.counseling.noAvailabilityDesc")}
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Calendar defines the row height */}
          <div className="lg:pr-[calc(320px+1.5rem)]">
            <section className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#193852]">
                {t("student.counseling.selectDate")}
              </h2>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMonth((m) => addMonths(m, -1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-[9rem] text-center text-sm font-semibold">
                  {format(viewMonth, "MMMM yyyy")}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMonth((m) => addMonths(m, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1">
              {WEEKDAY_KEYS.map((d) => (
                <div
                  key={d}
                  className="py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {t(`student.counseling.weekdays.${d}`)}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const hasSlots = availableDates.has(key);
                const inMonth = isSameMonth(day, viewMonth);
                const isPast = isBefore(startOfDay(day), startOfDay(today));
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const clickable = hasSlots && inMonth && !isPast;

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={!clickable}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      "relative flex min-h-11 min-w-[2.75rem] touch-manipulation items-center justify-center rounded-lg text-sm font-medium transition-all",
                      !inMonth && "text-muted-foreground/30",
                      inMonth && !hasSlots && "text-muted-foreground",
                      inMonth && isPast && "text-muted-foreground/40",
                      clickable && !isSelected && "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25",
                      clickable && isSelected && "bg-blue-600 text-white shadow-md ring-2 ring-blue-400/50",
                      isToday(day) && !isSelected && clickable && "ring-1 ring-blue-400"
                    )}
                  >
                    {format(day, "d")}
                    {hasSlots && inMonth && !isPast && !isSelected && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-blue-500" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-blue-500/20 ring-1 ring-blue-400/40" />
                {t("student.counseling.counselorAvailable")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-blue-600" />
                {t("student.counseling.selectedDay")}
              </span>
            </div>
          </section>
          </div>

          {/* Time slots — locked to calendar height; list scrolls inside */}
          <section className="mt-6 flex max-h-72 flex-col overflow-hidden rounded-2xl border border-border bg-card lg:absolute lg:right-0 lg:top-0 lg:mt-0 lg:h-full lg:max-h-none lg:w-80">
            <div className="shrink-0 border-b border-border/60 px-5 py-4">
              {selectedFrameId && (
                <button
                  type="button"
                  onClick={() => setSelectedFrameId(null)}
                  className="mb-2 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  {t("student.counseling.allTimeFrames")}
                </button>
              )}
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#193852]">
                {!selectedDate
                  ? t("student.counseling.pickDay")
                  : selectedFrame
                    ? `${formatTimeLabel(selectedFrame.start_time)} – ${formatTimeLabel(selectedFrame.end_time)}`
                    : format(selectedDate, "EEEE, MMM d")}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {!selectedDate
                  ? t("student.counseling.pickDayHint")
                  : selectedFrame
                    ? t("student.counseling.chooseTime").replace("{counselor}", selectedFrame.counselor_name)
                    : t("student.counseling.chooseWindow")}
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-2">
                {!selectedDate && (
                  <div className="rounded-lg bg-muted/50 px-4 py-8 text-center text-sm text-muted-foreground">
                    {t("student.counseling.clickHighlightedDate")}
                  </div>
                )}

                {selectedDate && !selectedFrameId && framesForDay.length === 0 && (
                  <div className="rounded-lg bg-muted/50 px-4 py-8 text-center text-sm text-muted-foreground">
                    {t("student.counseling.noAvailabilityDay")}
                  </div>
                )}

                {/* Step 1: counselor time frames (e.g. 9–11, 2–5) */}
                {selectedDate &&
                  !selectedFrameId &&
                  framesForDay.map((frame) => (
                    <button
                      key={frame.id}
                      type="button"
                      onClick={() => setSelectedFrameId(frame.id)}
                      className={cn(
                        "flex min-h-11 w-full touch-manipulation items-center gap-3 rounded-xl border border-border bg-background p-3 text-left transition-all",
                        "hover:border-blue-400 hover:bg-blue-50/50"
                      )}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">
                          {formatTimeLabel(frame.start_time)} – {formatTimeLabel(frame.end_time)}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {frame.counselor_name} · {frame.slots.length}{" "}
                          {frame.slots.length === 1 ? t("common.slot") : t("common.slots")}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  ))}

                {/* Step 2: bookable times within the frame */}
                {selectedFrameId &&
                  frameTimeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                        setError(null);
                        setSuccess(false);
                        setSelectedSlot(slot);
                      }}
                      className={cn(
                        "flex min-h-11 w-full touch-manipulation items-center gap-3 rounded-xl border border-border bg-background p-3 text-left transition-all",
                        "hover:border-blue-400 hover:bg-blue-50/50"
                      )}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">
                          {new Date(slot.slot_at).toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("common.minSession").replace("{minutes}", String(slot.duration_minutes))}
                        </p>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </section>
        </div>
      )}

      <Dialog open={!!selectedSlot} onOpenChange={(open) => !open && setSelectedSlot(null)}>
        <DialogContent className="sm:max-w-md">
          {success ? (
            <DialogHeader>
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <DialogTitle className="text-center">{t("student.counseling.sessionBookedTitle")}</DialogTitle>
              <DialogDescription className="text-center">
                {t("student.counseling.sessionBookedDesc")}
              </DialogDescription>
            </DialogHeader>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{t("student.counseling.confirmTitle")}</DialogTitle>
                <DialogDescription>
                  {selectedSlot && (
                    <>
                      {selectedSlot.counselor_name} · {formatSlotTime(selectedSlot.slot_at)}
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-2">
                <Label htmlFor="topic">{t("student.counseling.topicLabel")}</Label>
                <Textarea
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={t("student.counseling.topicPlaceholder")}
                  rows={3}
                  className="resize-none"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setSelectedSlot(null)}>
                  {t("common.cancel")}
                </Button>
                <Button onClick={handleBook} disabled={loading}>
                  {loading ? t("student.counseling.booking") : t("student.counseling.bookSession")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!cancelTargetId} onOpenChange={(open) => !open && setCancelTargetId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("student.counseling.cancelTitle")}</DialogTitle>
            <DialogDescription>
              {t("student.counseling.cancelDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCancelTargetId(null)} disabled={loading}>
              {t("student.counseling.keepSession")}
            </Button>
            <Button variant="destructive" onClick={handleCancelConfirm} disabled={loading}>
              {loading ? t("student.counseling.cancelling") : t("student.counseling.yesCancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
