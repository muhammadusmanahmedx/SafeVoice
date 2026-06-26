"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRoleDashboard } from "@/lib/auth/get-profile";
import { normalizeRole } from "@/lib/auth/roles";

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { error: error.message };

  const userId = authData.user?.id;
  if (!userId) return { error: "Sign in failed" };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    return {
      error:
        "Your account exists but has no profile yet. Please register through the correct portal or contact your administrator.",
    };
  }

  return { redirectTo: getRoleDashboard(normalizeRole(profile.role)) };
}

export async function signUpStudent(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const displayName = formData.get("displayName") as string;
  const institutionId = formData.get("institutionId") as string;

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) return { error: authError.message };
  if (!authData.user) return { error: "Failed to create account" };

  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    institution_id: institutionId,
    role: "student",
    display_name: displayName,
  });

  if (profileError) return { error: profileError.message };

  return { redirectTo: "/dashboard" };
}

export async function signUpCounselor(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const displayName = formData.get("displayName") as string;
  const counselorCode = formData.get("counselorCode") as string;

  const { data: codeData, error: codeError } = await supabase
    .from("counselor_codes")
    .select("*")
    .eq("code", counselorCode)
    .is("used_by", null)
    .single();

  if (codeError || !codeData) {
    return { error: "Invalid or expired counselor access code" };
  }

  if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
    return { error: "Counselor access code has expired" };
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) return { error: authError.message };
  if (!authData.user) return { error: "Failed to create account" };

  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    institution_id: codeData.institution_id,
    role: "counselor",
    display_name: displayName,
  });

  if (profileError) return { error: profileError.message };

  await supabase
    .from("counselor_codes")
    .update({ used_by: authData.user.id, used_at: new Date().toISOString() })
    .eq("id", codeData.id);

  return { redirectTo: "/counselor/dashboard" };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getInstitutions() {
  const supabase = await createClient();
  const { data } = await supabase.from("institutions").select("id, name, slug").order("name");
  return data ?? [];
}
