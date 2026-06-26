"use server";

import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/get-profile";
import type { EscalationData } from "@/types";
import { revalidatePath } from "next/cache";

export async function createCaseFromEscalation(
  conversationId: string,
  escalation: EscalationData,
  summary: string,
  incidentType: string,
  severity: string,
  shareIdentity = false
) {
  const profile = await requireProfile(["student"]);
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("cases")
    .select("id, auto_alerted")
    .eq("conversation_id", conversationId)
    .maybeSingle();

  if (existing?.auto_alerted) {
    const { data: updated, error: updateError } = await supabase
      .from("cases")
      .update({
        incident_type: incidentType,
        severity: severity as "low" | "medium" | "high" | "critical",
        summary,
        location: escalation.location,
        duration: escalation.duration,
        people_involved: escalation.peopleInvolved,
        others_affected: escalation.othersAffected,
        identity_revealed: shareIdentity,
        auto_alerted: false,
        status: "new",
        recommended_action: "Counselor review and follow-up.",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select("id")
      .single();

    if (updateError) return { error: updateError.message };
    revalidatePath("/cases");
    revalidatePath("/dashboard");
    revalidatePath("/counselor/alerts");
    revalidatePath("/counselor/dashboard");
    return { caseId: updated.id };
  }

  const { data, error } = await supabase
    .from("cases")
    .insert({
      institution_id: profile.institution_id,
      conversation_id: conversationId,
      student_id: profile.id,
      incident_type: incidentType,
      severity: severity as "low" | "medium" | "high" | "critical",
      summary,
      location: escalation.location,
      duration: escalation.duration,
      people_involved: escalation.peopleInvolved,
      others_affected: escalation.othersAffected,
      identity_revealed: shareIdentity,
      status: "new",
      recommended_action: "Counselor review and follow-up.",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/cases");
  revalidatePath("/dashboard");
  return { caseId: data.id };
}
