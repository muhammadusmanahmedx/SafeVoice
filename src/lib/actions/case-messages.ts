"use server";

import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/get-profile";
import { revalidatePath } from "next/cache";

export async function sendCaseMessage(caseId: string, content: string) {
  const profile = await requireProfile(["student", "faculty", "admin"]);
  const supabase = await createClient();
  const senderRole = profile.role === "student" ? "student" : "faculty";

  const { error } = await supabase.from("case_messages").insert({
    case_id: caseId,
    sender_role: senderRole,
    content,
  });

  if (error) return { error: error.message };
  revalidatePath("/cases");
  revalidatePath(`/faculty/cases/${caseId}`);
  return { success: true };
}

export async function respondToIdentityReveal(requestId: string, accept: boolean) {
  await requireProfile(["student"]);
  const supabase = await createClient();

  const { data: request, error: fetchError } = await supabase
    .from("identity_reveal_requests")
    .select("case_id")
    .eq("id", requestId)
    .single();

  if (fetchError || !request) return { error: fetchError?.message ?? "Request not found" };

  const { error } = await supabase
    .from("identity_reveal_requests")
    .update({
      status: accept ? "accepted" : "declined",
      responded_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (error) return { error: error.message };

  if (accept) {
    await supabase
      .from("cases")
      .update({ identity_revealed: true, updated_at: new Date().toISOString() })
      .eq("id", request.case_id);
  }

  revalidatePath("/cases");
  revalidatePath(`/faculty/cases/${request.case_id}`);
  return { success: true };
}

export async function requestIdentityReveal(caseId: string) {
  const profile = await requireProfile(["faculty", "admin"]);
  const supabase = await createClient();

  const { error } = await supabase.from("identity_reveal_requests").insert({
    case_id: caseId,
    requested_by: profile.id,
    status: "pending",
  });

  if (error) return { error: error.message };
  revalidatePath(`/faculty/cases/${caseId}`);
  return { success: true };
}

export async function updateCaseStatus(
  caseId: string,
  status: "new" | "in_progress" | "escalated" | "resolved" | "unsubstantiated"
) {
  await requireProfile(["faculty", "admin"]);
  const supabase = await createClient();

  const { error } = await supabase
    .from("cases")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", caseId);

  if (error) return { error: error.message };
  revalidatePath(`/faculty/cases/${caseId}`);
  revalidatePath("/faculty/dashboard");
  return { success: true };
}

export async function addCaseNote(caseId: string, content: string) {
  const profile = await requireProfile(["faculty", "admin"]);
  const supabase = await createClient();

  const { error } = await supabase.from("case_notes").insert({
    case_id: caseId,
    author_id: profile.id,
    content,
  });

  if (error) return { error: error.message };
  revalidatePath(`/faculty/cases/${caseId}`);
  return { success: true };
}
