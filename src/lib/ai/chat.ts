import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import type { ModelMessage } from "ai";
import type { Locale } from "@/lib/i18n";
import { getWellbeingSystemPrompt } from "./prompts";

export function createChatStream(
  messages: ModelMessage[],
  locale: Locale = "en",
  onFinish?: (text: string) => Promise<void>
) {
  return streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: getWellbeingSystemPrompt(locale),
    messages,
    onFinish: async ({ text }) => {
      if (onFinish) await onFinish(text);
    },
  });
}

export { assessConversationRisk, generateMoodInsight, shouldShowEscalation, defaultRiskAssessment } from "./risk";
