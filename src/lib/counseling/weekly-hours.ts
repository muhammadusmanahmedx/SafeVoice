export type TimeRange = { start: string; end: string };

export type WeeklySchedule = Record<number, TimeRange[]>;

export const WEEKDAYS = [
  { day: 0, letter: "S", name: "Sunday" },
  { day: 1, letter: "M", name: "Monday" },
  { day: 2, letter: "T", name: "Tuesday" },
  { day: 3, letter: "W", name: "Wednesday" },
  { day: 4, letter: "T", name: "Thursday" },
  { day: 5, letter: "F", name: "Friday" },
  { day: 6, letter: "S", name: "Saturday" },
] as const;

export const WEEKS_AHEAD = 8;
export const DEFAULT_DURATION = 30;

export function emptySchedule(): WeeklySchedule {
  return { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  const aStart = timeToMinutes(a.start);
  const aEnd = timeToMinutes(a.end);
  const bStart = timeToMinutes(b.start);
  const bEnd = timeToMinutes(b.end);
  return aStart < bEnd && bStart < aEnd;
}

export function getOverlappingIndices(ranges: TimeRange[]): Set<number> {
  const overlapping = new Set<number>();
  for (let i = 0; i < ranges.length; i++) {
    for (let j = i + 1; j < ranges.length; j++) {
      if (rangesOverlap(ranges[i], ranges[j])) {
        overlapping.add(i);
        overlapping.add(j);
      }
    }
  }
  return overlapping;
}

export function scheduleFromDbRows(
  rows: { day_of_week: number; start_time: string; end_time: string }[]
): WeeklySchedule {
  const schedule = emptySchedule();
  for (const row of rows) {
    const start = row.start_time.slice(0, 5);
    const end = row.end_time.slice(0, 5);
    schedule[row.day_of_week].push({ start, end });
  }
  for (const day of Object.keys(schedule)) {
    schedule[Number(day)].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  }
  return schedule;
}

/** Generate bookable slot timestamps for the next N weeks from a weekly schedule. */
export function generateSlotTimes(
  schedule: WeeklySchedule,
  durationMinutes: number,
  weeksAhead = WEEKS_AHEAD
): Date[] {
  const slots: Date[] = [];
  const now = new Date();
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);

  for (let d = 0; d < weeksAhead * 7; d++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + d);
    const dayOfWeek = date.getDay();
    const ranges = schedule[dayOfWeek] ?? [];

    for (const range of ranges) {
      let cursor = timeToMinutes(range.start);
      const end = timeToMinutes(range.end);

      while (cursor + durationMinutes <= end) {
        const slot = new Date(date);
        slot.setHours(Math.floor(cursor / 60), cursor % 60, 0, 0);
        if (slot > now) slots.push(new Date(slot));
        cursor += durationMinutes;
      }
    }
  }

  return slots;
}
