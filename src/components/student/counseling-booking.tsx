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
  faculty_id: string;
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

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CounselingBookingPanel({
  availableSlots,
  weeklyRanges,
  myBookings,
}: CounselingBookingPanelProps) {
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
            Your Upcoming Sessions
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
                      <p className="mt-1 text-xs text-muted-foreground">Topic: {booking.topic}</p>
                    )}
                    {!canJoinSession(booking.slot.slot_at, booking.slot.duration_minutes) && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Join available on {formatSessionDay(booking.slot.slot_at)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {canJoinSession(booking.slot.slot_at, booking.slot.duration_minutes) && (
                    <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      <Link href={`/counseling/meeting/${booking.id}`}>
                        <Video className="mr-1.5 h-3.5 w-3.5" />
                        Join session
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
                    Cancel
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
          <p className="mt-3 text-sm font-medium">No counseling availability yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Faculty counselors haven&apos;t published their weekly hours. Check back soon.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Calendar defines the row height */}
          <div className="lg:pr-[calc(320px+1.5rem)]">
            <section className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#193852]">
                Select a date
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
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {d}
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
                      "relative flex h-11 items-center justify-center rounded-lg text-sm font-medium transition-all",
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
                Counselor available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-blue-600" />
                Selected day
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
                  All time frames
                </button>
              )}
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#193852]">
                {!selectedDate
                  ? "Pick a day"
                  : selectedFrame
                    ? `${formatTimeLabel(selectedFrame.start_time)} – ${formatTimeLabel(selectedFrame.end_time)}`
                    : format(selectedDate, "EEEE, MMM d")}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {!selectedDate
                  ? "Blue dates on the calendar have open slots."
                  : selectedFrame
                    ? `${selectedFrame.counselor_name} · choose a time`
                    : "Choose an availability window."}
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-2">
                {!selectedDate && (
                  <div className="rounded-lg bg-muted/50 px-4 py-8 text-center text-sm text-muted-foreground">
                    Click a highlighted date on the calendar
                  </div>
                )}

                {selectedDate && !selectedFrameId && framesForDay.length === 0 && (
                  <div className="rounded-lg bg-muted/50 px-4 py-8 text-center text-sm text-muted-foreground">
                    No availability on this day
                  </div>
                )}

                {/* Step 1: faculty time frames (e.g. 9–11, 2–5) */}
                {selectedDate &&
                  !selectedFrameId &&
                  framesForDay.map((frame) => (
                    <button
                      key={frame.id}
                      type="button"
                      onClick={() => setSelectedFrameId(frame.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border border-border bg-background p-3 text-left transition-all",
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
                          {frame.counselor_name} · {frame.slots.length} slot
                          {frame.slots.length === 1 ? "" : "s"}
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
                        "flex w-full items-center gap-3 rounded-xl border border-border bg-background p-3 text-left transition-all",
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
                          {slot.duration_minutes} min session
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
              <DialogTitle className="text-center">Session Booked!</DialogTitle>
              <DialogDescription className="text-center">
                Your counseling session is confirmed.
              </DialogDescription>
            </DialogHeader>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Confirm your session</DialogTitle>
                <DialogDescription>
                  {selectedSlot && (
                    <>
                      {selectedSlot.counselor_name} · {formatSlotTime(selectedSlot.slot_at)}
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-2">
                <Label htmlFor="topic">What would you like to discuss? (optional)</Label>
                <Textarea
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Exam stress, anxiety, relationship concerns…"
                  rows={3}
                  className="resize-none"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setSelectedSlot(null)}>
                  Cancel
                </Button>
                <Button onClick={handleBook} disabled={loading}>
                  {loading ? "Booking…" : "Book session"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!cancelTargetId} onOpenChange={(open) => !open && setCancelTargetId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel counseling session?</DialogTitle>
            <DialogDescription>
              This will remove your booking and free the time slot for other students.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCancelTargetId(null)} disabled={loading}>
              No, keep session
            </Button>
            <Button variant="destructive" onClick={handleCancelConfirm} disabled={loading}>
              {loading ? "Cancelling…" : "Yes, cancel session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
