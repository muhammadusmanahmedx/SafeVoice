"use server";

import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/get-profile";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

export async function generateCounselorCode(expiresInDays = 30) {
  const profile = await requireProfile(["admin"]);
  const supabase = await createClient();

  const code = `FAC-${randomBytes(4).toString("hex").toUpperCase()}`;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const { error } = await supabase.from("counselor_codes").insert({
    institution_id: profile.institution_id,
    code,
    created_by: profile.id,
    expires_at: expiresAt.toISOString(),
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/counselors");
  return { code };
}

export async function toggleCounselorActive(counselorId: string, isActive: boolean) {
  const profile = await requireProfile(["admin"]);
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", counselorId)
    .eq("institution_id", profile.institution_id)
    .eq("role", "counselor");

  if (error) return { error: error.message };
  revalidatePath("/admin/counselors");
  return { success: true };
}

export async function createAnnouncement(title: string, content: string) {
  const profile = await requireProfile(["admin"]);
  const supabase = await createClient();

  const { error } = await supabase.from("announcements").insert({
    institution_id: profile.institution_id,
    title,
    content,
    created_by: profile.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/announcements");
  return { success: true };
}

export async function deleteAnnouncement(id: string) {
  const profile = await requireProfile(["admin"]);
  const supabase = await createClient();

  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id)
    .eq("institution_id", profile.institution_id);

  if (error) return { error: error.message };
  revalidatePath("/admin/announcements");
  return { success: true };
}

export async function updateInstitutionSettings(name: string) {
  const profile = await requireProfile(["admin"]);
  const supabase = await createClient();

  const { error } = await supabase
    .from("institutions")
    .update({ name })
    .eq("id", profile.institution_id);

  if (error) return { error: error.message };
  revalidatePath("/admin/settings");
  return { success: true };
}
