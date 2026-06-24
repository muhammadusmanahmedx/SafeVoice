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

  const { data, error } = await supabase
    .from("cases")
    .insert({
      institution_id: profile.institution_id,
      conversation_id: conversationId,
      student_id: profile.id,
      incident_type: incidentType,
      severity: severity as "low" | "medium" | "high" | "critical",
      summary: shareIdentity
        ? `[Identity shared by student] ${summary}`
        : summary,
      location: escalation.location,
      duration: escalation.duration,
      people_involved: escalation.peopleInvolved,
      others_affected: escalation.othersAffected,
      status: "new",
      recommended_action: "Faculty review and follow-up.",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/cases");
  revalidatePath("/dashboard");
  return { caseId: data.id };
}
