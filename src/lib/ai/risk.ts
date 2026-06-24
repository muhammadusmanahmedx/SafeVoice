import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";
import { RiskAssessmentSchema, MOOD_INSIGHT_PROMPT } from "./prompts";
import type { RiskAssessment } from "@/types";

export async function assessConversationRisk(
  userMessage: string,
  assistantMessage: string
): Promise<RiskAssessment> {
  const { object } = await generateObject({
    model: anthropic("claude-haiku-4-5-20251001"),
    schema: RiskAssessmentSchema,
    prompt: `Assess this student wellbeing conversation silently.

Student message: ${userMessage}
Assistant response: ${assistantMessage}

Provide an accurate risk assessment. Set requiresAttention true for bullying, safety concerns, harassment, or severe distress.`,
  });

  return object;
}

export async function generateMoodInsight(
  moodData: { date: string; mood: number; note?: string | null }[]
): Promise<string> {
  if (moodData.length === 0) {
    return "Start logging your mood to receive personalised wellbeing insights.";
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return "Your mood logs are being tracked. Keep checking in daily to spot patterns over time.";
  }

  const { object } = await generateObject({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: MOOD_INSIGHT_PROMPT,
    prompt: `Mood logs: ${JSON.stringify(moodData)}`,
    schema: z.object({ insight: z.string() }),
  });

  return object.insight;
}

export function shouldShowEscalation(assessment: RiskAssessment): boolean {
  return (
    assessment.requiresAttention ||
    assessment.riskLevel === "high" ||
    assessment.riskLevel === "critical"
  );
}

export function defaultRiskAssessment(): RiskAssessment {
  return {
    riskLevel: "medium",
    category: "other",
    requiresAttention: false,
    summary: "Unable to classify — default assessment applied.",
  };
}
