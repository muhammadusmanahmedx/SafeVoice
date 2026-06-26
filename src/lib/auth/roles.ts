import type { UserRole } from "@/types";

/** Legacy DB rows may still use `faculty` before enum migration. */
export function normalizeRole(role: string): UserRole {
  if (role === "faculty") return "counselor";
  return role as UserRole;
}

export function isCounselorRole(role: string): boolean {
  return role === "counselor" || role === "faculty";
}

export function roleMatches(role: string, allowed: UserRole[]): boolean {
  return allowed.includes(normalizeRole(role));
}
