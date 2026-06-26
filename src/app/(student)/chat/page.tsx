import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ChatPageHeader } from "@/components/student/chat-page-header";

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
    <div className="flex h-full min-h-0 flex-col gap-4">
      <ChatPageHeader />
      <ChatInterface initialConversationId={id} initialMessages={initialMessages} />
    </div>
  );
}
