function startOfDay(d: Date): Date {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  return s;
}

function endOfDay(d: Date): Date {
  const e = new Date(d);
  e.setHours(23, 59, 59, 999);
  return e;
}

/**
 * Joinable for the entire scheduled calendar day (midnight → end of day).
 * No 15-minute early window — both student and faculty can join any time that day.
 */
export function canJoinSession(
  slotAt: string | Date,
  _durationMinutes?: number,
  now: Date = new Date()
): boolean {
  const day = new Date(slotAt);
  return now >= startOfDay(day) && now <= endOfDay(day);
}

/** When the join button becomes available (start of the scheduled day). */
export function joinOpensAt(slotAt: string | Date): Date {
  return startOfDay(new Date(slotAt));
}

/**
 * Whether a booking should still be shown as active/upcoming. It stays until the
 * end of its scheduled day, then disperses (hidden) the following day.
 */
export function isBookingActive(slotAt: string | Date, now: Date = new Date()): boolean {
  return now <= endOfDay(new Date(slotAt));
}

export function isSameSessionDay(slotAt: string | Date, now: Date = new Date()): boolean {
  return canJoinSession(slotAt, undefined, now);
}
