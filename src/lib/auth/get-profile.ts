import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";
import type { Tables } from "@/types/database";

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
  if (allowedRoles && !allowedRoles.includes(profile.role as UserRole)) {
    if (profile.role === "admin") redirect("/admin/dashboard");
    if (profile.role === "faculty") redirect("/faculty/dashboard");
    redirect("/dashboard");
    throw new Error("Forbidden");
  }
  return profile;
}

export async function requireApiProfile(allowedRoles?: UserRole[]) {
  const profile = await getProfile();
  if (!profile) return { error: "Unauthorized", status: 401 as const };
  if (allowedRoles && !allowedRoles.includes(profile.role as UserRole)) {
    return { error: "Forbidden", status: 403 as const };
  }
  return { profile };
}

export function getRoleDashboard(role: UserRole) {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "faculty":
      return "/faculty/dashboard";
    default:
      return "/dashboard";
  }
}
