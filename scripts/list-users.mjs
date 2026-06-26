import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const RIVERSIDE_ID = "11111111-1111-1111-1111-111111111111";
const DEMO_PASSWORD = "Demo@SafeVoice1";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: list } = await supabase.auth.admin.listUsers();
  const users = list?.users ?? [];

  for (const u of users) {
    const { data: profile } = await supabase.from("profiles").select("role, display_name").eq("id", u.id).maybeSingle();
    console.log(`${u.email?.padEnd(30)} profile: ${profile?.role ?? "MISSING"} ${profile?.display_name ?? ""}`);
  }
}

main().catch(console.error);
