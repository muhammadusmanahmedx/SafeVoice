import { createClient } from "@/lib/supabase/server";
import { requireApiProfile } from "@/lib/auth/get-profile";

export async function GET(req: Request) {
  const auth = await requireApiProfile(["student"]);
  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return Response.json({ error: "conversationId required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("risk_assessments")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) return Response.json({ assessment: null });

  return Response.json({
    assessment: {
      riskLevel: data.risk_level,
      category: data.category,
      requiresAttention: data.requires_attention,
      summary: data.summary,
    },
  });
}
