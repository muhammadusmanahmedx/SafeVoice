import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { RiskAssessment } from "@/types";

type ServiceClient = SupabaseClient<Database>;

export function shouldAutoAlertFaculty(assessment: RiskAssessment): boolean {
  return (
    assessment.riskLevel === "high" ||
    assessment.riskLevel === "critical" ||
    (assessment.requiresAttention && assessment.riskLevel !== "low")
  );
}

export async function maybeCreateAutoAlert(
  serviceClient: ServiceClient,
  params: {
    conversationId: string;
    institutionId: string;
    studentId: string;
    assessment: RiskAssessment;
  }
): Promise<string | null> {
  if (!shouldAutoAlertFaculty(params.assessment)) return null;

  const { data: existing } = await serviceClient
    .from("cases")
    .select("id")
    .eq("conversation_id", params.conversationId)
    .limit(1)
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await serviceClient
    .from("cases")
    .insert({
      institution_id: params.institutionId,
      conversation_id: params.conversationId,
      student_id: params.studentId,
      incident_type: params.assessment.category,
      severity: params.assessment.riskLevel,
      summary: `[Auto-alert] ${params.assessment.summary}`,
      status: "new",
      auto_alerted: true,
      recommended_action:
        "Review AI-detected risk. Student has not formally escalated — reach out via anonymous messaging if appropriate.",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Auto-alert failed:", error.message);
    return null;
  }

  return data.id;
}
