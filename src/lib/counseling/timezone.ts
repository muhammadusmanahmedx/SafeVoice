import { cookies } from "next/headers";

const COOKIE_NAME = "user-timezone";

export function getUserTimeZoneFromCookies(): string | undefined {
  const value = cookies().get(COOKIE_NAME)?.value;
  if (!value) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return undefined;
  }
}

export function getUserTimeZoneFromRequest(req: Request): string | undefined {
  const header = req.headers.get("x-user-timezone");
  if (header) return header;

  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/(?:^|;\s*)user-timezone=([^;]*)/);
  if (!match) return undefined;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return undefined;
  }
}

export function resolveTimeZone(preferred?: string): string {
  return preferred ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
}
