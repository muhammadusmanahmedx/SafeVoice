import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { ChatInterface } from "@/components/chat/chat-interface";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  await requireProfile(["student"]);
  const { id } = await searchParams;
  const supabase = await createClient();

  let initialMessages: { role: "user" | "assistant"; content: string }[] = [];

  if (id) {
    const { data: messages } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    initialMessages = (messages ?? []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">AI Wellbeing Assistant</h1>
        <p className="text-sm text-muted-foreground">
          Private and confidential — everything you share stays between you and SafeVoice
        </p>
      </div>
      <ChatInterface initialConversationId={id} initialMessages={initialMessages} />
    </div>
  );
}
