import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, anon);

await supabase.auth.signInWithPassword({
  email: "student@riverside.demo",
  password: "Demo@SafeVoice1",
});

const { data: profile } = await supabase
  .from("profiles")
  .select("institution_id")
  .eq("id", (await supabase.auth.getUser()).data.user.id)
  .single();

console.log("Student institution:", profile?.institution_id);

const now = new Date().toISOString();
const { data: allSlots, error } = await supabase
  .from("counseling_slots")
  .select(`
    id, slot_at, duration_minutes, counselor_id,
    counselor:profiles!counseling_slots_counselor_id_fkey (display_name)
  `)
  .eq("institution_id", profile.institution_id)
  .gte("slot_at", now)
  .order("slot_at", { ascending: true })
  .limit(5);

console.log("Join query error:", error?.message, error?.details, error?.hint);
console.log("Slots:", allSlots?.length, allSlots?.[0]);

const { data: weeklyRows, error: wErr } = await supabase
  .from("counselor_weekly_availability")
  .select(`
    counselor_id, day_of_week, start_time, end_time,
    counselor:profiles!counselor_weekly_availability_counselor_id_fkey (display_name)
  `)
  .eq("institution_id", profile.institution_id);

console.log("Weekly join error:", wErr?.message, wErr?.details, wErr?.hint);
console.log("Weekly:", weeklyRows?.length);
