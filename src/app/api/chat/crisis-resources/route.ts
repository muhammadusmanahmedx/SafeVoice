import { createClient } from "@/lib/supabase/server";
import { requireApiProfile } from "@/lib/auth/get-profile";

export async function GET(req: Request) {
  const auth = await requireApiProfile(["student"]);
  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? "mental_health";
  const institutionId = auth.profile.institution_id;
  const supabase = await createClient();

  const [{ data: helplines }, { data: institution }, { data: related }] = await Promise.all([
    supabase
      .from("resources")
      .select("id, title, description, type, url, content, category")
      .eq("is_global", true)
      .eq("type", "helpline"),
    supabase
      .from("resources")
      .select("id, title, description, type, url, content, category")
      .eq("institution_id", institutionId)
      .eq("type", "institution"),
    supabase
      .from("resources")
      .select("id, title, description, type, url, content, category")
      .eq("is_global", true)
      .in("category", [category, "mental_health"])
      .in("type", ["helpline", "institution"]),
  ]);

  const seen = new Set<string>();
  const resources = [...(helplines ?? []), ...(institution ?? []), ...(related ?? [])].filter(
    (r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    }
  ).slice(0, 4);

  return Response.json({ resources });
}
