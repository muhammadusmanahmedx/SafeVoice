/** Calendar date in a timezone as YYYY-MM-DD (en-CA locale). */
export function localDateKey(d: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function runtimeTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Joinable for the entire scheduled calendar day in the user's timezone.
 * No 15-minute early window — both student and faculty can join any time that day.
 */
export function canJoinSession(
  slotAt: string | Date,
  _durationMinutes?: number,
  now: Date = new Date(),
  timeZone: string = runtimeTimeZone()
): boolean {
  const slot = new Date(slotAt);
  return localDateKey(slot, timeZone) === localDateKey(now, timeZone);
}

/** Human-readable scheduled day for join messaging. */
export function formatSessionDay(
  slotAt: string | Date,
  timeZone: string = runtimeTimeZone()
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(slotAt));
}

/**
 * Whether a booking should still be shown as active/upcoming. It stays until the
 * end of its scheduled day, then disperses (hidden) the following day.
 */
export function isBookingActive(
  slotAt: string | Date,
  now: Date = new Date(),
  timeZone: string = runtimeTimeZone()
): boolean {
  return localDateKey(now, timeZone) <= localDateKey(new Date(slotAt), timeZone);
}

export function isSameSessionDay(
  slotAt: string | Date,
  now: Date = new Date(),
  timeZone: string = runtimeTimeZone()
): boolean {
  return canJoinSession(slotAt, undefined, now, timeZone);
}
