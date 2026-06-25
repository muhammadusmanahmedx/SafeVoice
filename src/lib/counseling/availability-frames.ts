import type { CounselingSlot } from "@/components/student/counseling-booking";

export interface WeeklyAvailabilityRange {
  faculty_id: string;
  counselor_name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface AvailabilityFrame {
  id: string;
  faculty_id: string;
  counselor_name: string;
  start_time: string;
  end_time: string;
  slots: CounselingSlot[];
}

function dateAtTime(date: Date, timeStr: string): Date {
  const [h, m] = timeStr.slice(0, 5).split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

export function formatTimeLabel(timeStr: string): string {
  const [h, m] = timeStr.slice(0, 5).split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function getFramesForDay(
  date: Date,
  weeklyRanges: WeeklyAvailabilityRange[],
  daySlots: CounselingSlot[]
): AvailabilityFrame[] {
  const dayOfWeek = date.getDay();
  const ranges = weeklyRanges.filter((r) => r.day_of_week === dayOfWeek);

  const frames: AvailabilityFrame[] = [];

  for (const range of ranges) {
    const rangeStart = dateAtTime(date, range.start_time);
    const rangeEnd = dateAtTime(date, range.end_time);

    const slotsInFrame = daySlots.filter((s) => {
      if (s.faculty_id !== range.faculty_id) return false;
      const slotStart = new Date(s.slot_at);
      return slotStart >= rangeStart && slotStart < rangeEnd;
    });

    if (slotsInFrame.length === 0) continue;

    frames.push({
      id: `${range.faculty_id}-${range.start_time}-${range.end_time}`,
      faculty_id: range.faculty_id,
      counselor_name: range.counselor_name,
      start_time: range.start_time,
      end_time: range.end_time,
      slots: slotsInFrame.sort(
        (a, b) => new Date(a.slot_at).getTime() - new Date(b.slot_at).getTime()
      ),
    });
  }

  return frames.sort((a, b) => a.start_time.localeCompare(b.start_time));
}
