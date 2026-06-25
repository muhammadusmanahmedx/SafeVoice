import { convertToModelMessages, type UIMessage } from "ai";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  assessConversationRisk,
  createChatStream,
  defaultRiskAssessment,
} from "@/lib/ai/chat";
import { requireApiProfile } from "@/lib/auth/get-profile";
import { maybeCreateAutoAlert } from "@/lib/safeguarding/auto-alert";

export async function POST(req: Request) {
  try {
    const auth = await requireApiProfile(["student"]);
    if ("error" in auth) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    const profile = auth.profile;

    const { messages, conversationId } = await req.json();
    const uiMessages = messages as UIMessage[];

    const supabase = await createClient();
    let convId = conversationId as string | undefined;

    if (!convId) {
      const lastText =
        uiMessages
          .filter((m) => m.role === "user")
          .pop()
          ?.parts.filter((p) => p.type === "text")
          .map((p) => p.text)
          .join("") ?? "New Conversation";

      const { data: conv, error } = await supabase
        .from("conversations")
        .insert({
          institution_id: profile.institution_id,
          student_id: profile.id,
          title: lastText.slice(0, 50) || "New Conversation",
        })
        .select("id")
        .single();

      if (error) return Response.json({ error: error.message }, { status: 500 });
      convId = conv.id;
    }

    const modelMessages = await convertToModelMessages(uiMessages);
    const lastUserMessage = modelMessages.filter((m) => m.role === "user").pop();
    const lastUserText =
      lastUserMessage?.role === "user"
        ? typeof lastUserMessage.content === "string"
          ? lastUserMessage.content
          : (lastUserMessage.content as Array<{ type: string; text?: string }>)
              .filter((p) => p.type === "text")
              .map((p) => p.text ?? "")
              .join("")
        : "";

    if (lastUserText) {
      await supabase.from("messages").insert({
        conversation_id: convId,
        role: "user",
        content: lastUserText,
      });
    }

    const finalConvId = convId;
    const result = createChatStream(modelMessages, async (fullText) => {
      try {
        const riskAssessment = lastUserText
          ? await assessConversationRisk(lastUserText, fullText)
          : defaultRiskAssessment();

        const serviceClient = await createServiceClient();

        const { data: assistantMsg } = await serviceClient
          .from("messages")
          .insert({
            conversation_id: finalConvId,
            role: "assistant",
            content: fullText,
          })
          .select("id")
          .single();

        if (assistantMsg) {
          await serviceClient.from("risk_assessments").insert({
            message_id: assistantMsg.id,
            conversation_id: finalConvId,
            institution_id: profile.institution_id,
            risk_level: riskAssessment.riskLevel,
            category: riskAssessment.category,
            requires_attention: riskAssessment.requiresAttention,
            summary: riskAssessment.summary,
          });

          await maybeCreateAutoAlert(serviceClient, {
            conversationId: finalConvId,
            institutionId: profile.institution_id,
            studentId: profile.id,
            assessment: riskAssessment,
          });
        }

        await serviceClient
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", finalConvId);
      } catch (err) {
        console.error("Failed to persist chat:", err);
      }
    });

    const responseHeaders: Record<string, string> = {};
    if (finalConvId) responseHeaders["X-Conversation-Id"] = finalConvId;
    return result.toUIMessageStreamResponse({ headers: responseHeaders });
  } catch (error) {
    console.error("Chat error:", error);
    return Response.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
