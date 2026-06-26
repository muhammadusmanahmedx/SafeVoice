import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";
import type { Tables } from "@/types/database";
import { normalizeRole, roleMatches } from "@/lib/auth/roles";

export type ProfileWithInstitution = Tables<"profiles"> & {
  institutions: Tables<"institutions"> | null;
};

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, institutions(*)")
    .eq("id", user.id)
    .single();

  return profile as ProfileWithInstitution | null;
}

export async function requireProfile(allowedRoles?: UserRole[]): Promise<ProfileWithInstitution> {
  const { redirect } = await import("next/navigation");
  const profile = await getProfile();
  if (!profile) {
    redirect("/login");
    throw new Error("Unauthorized");
  }
  if (allowedRoles && !roleMatches(profile.role, allowedRoles)) {
    const role = normalizeRole(profile.role);
    if (role === "admin") redirect("/admin/dashboard");
    if (role === "counselor") redirect("/counselor/dashboard");
    redirect("/dashboard");
    throw new Error("Forbidden");
  }
  return { ...profile, role: normalizeRole(profile.role) as UserRole } as ProfileWithInstitution;
}

export async function requireApiProfile(allowedRoles?: UserRole[]) {
  const profile = await getProfile();
  if (!profile) return { error: "Unauthorized", status: 401 as const };
  if (allowedRoles && !roleMatches(profile.role, allowedRoles)) {
    return { error: "Forbidden", status: 403 as const };
  }
  return { profile: { ...profile, role: normalizeRole(profile.role) } as ProfileWithInstitution };
}

export function getRoleDashboard(role: UserRole) {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "counselor":
      return "/counselor/dashboard";
    default:
      return "/dashboard";
  }
}
