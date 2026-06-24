"use server";

import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/get-profile";
import { revalidatePath } from "next/cache";
import type { MoodLevel } from "@/types";

export async function logMood(mood: MoodLevel, note?: string) {
  const profile = await requireProfile(["student"]);
  const supabase = await createClient();

  const { error } = await supabase.from("mood_logs").insert({
    student_id: profile.id,
    institution_id: profile.institution_id,
    mood,
    note: note || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/mood");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getMoodLogs(days = 30) {
  const profile = await requireProfile(["student"]);
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from("mood_logs")
    .select("*")
    .eq("student_id", profile.id)
    .gte("logged_at", since.toISOString())
    .order("logged_at", { ascending: true });

  return data ?? [];
}
