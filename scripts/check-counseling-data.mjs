import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: weekly } = await supabase.from("counselor_weekly_availability").select("*");
const { data: slots } = await supabase.from("counseling_slots").select("id, slot_at, counselor_id, institution_id").limit(10);
const { data: counselors } = await supabase.from("profiles").select("id, email, role, display_name, institution_id").in("role", ["counselor", "faculty"]);

console.log("Counselors:", counselors);
console.log("Weekly rows:", weekly?.length ?? 0, weekly);
console.log("Slots:", slots?.length ?? 0, slots);
