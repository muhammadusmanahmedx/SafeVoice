import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import type { ModelMessage } from "ai";
import { WELLBEING_SYSTEM_PROMPT } from "./prompts";

export function createChatStream(
  messages: ModelMessage[],
  onFinish?: (text: string) => Promise<void>
) {
  return streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: WELLBEING_SYSTEM_PROMPT,
    messages,
    onFinish: async ({ text }) => {
      if (onFinish) await onFinish(text);
    },
  });
}

export { assessConversationRisk, generateMoodInsight, shouldShowEscalation, defaultRiskAssessment } from "./risk";
