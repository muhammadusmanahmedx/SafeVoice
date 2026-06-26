import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const admin = createClient(url, key);
const now = new Date().toISOString();
const instId = "11111111-1111-1111-1111-111111111111";

const { data: futureSlots, count } = await admin
  .from("counseling_slots")
  .select("id, slot_at", { count: "exact" })
  .eq("institution_id", instId)
  .gte("slot_at", now);

console.log("Future slots (service role):", count, futureSlots?.slice(0, 5));

// Sign in as student and query
const student = createClient(url, anon);
const { data: signIn } = await admin.auth.admin.listUsers();
const studentUser = signIn.users.find((u) => u.email === "student@riverside.demo");
if (studentUser) {
  const { data: session } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: studentUser.email,
  });
  // use password sign in instead
  const { data: auth } = await student.auth.signInWithPassword({
    email: "student@riverside.demo",
    password: "Demo@SafeVoice1",
  });
  console.log("Student auth:", auth.user?.id ? "ok" : "fail");

  const { data: studentSlots, error } = await student
    .from("counseling_slots")
    .select("id, slot_at")
    .eq("institution_id", instId)
    .gte("slot_at", now)
    .limit(5);

  console.log("Student RLS slots:", studentSlots?.length, error?.message, studentSlots);

  const { data: weekly, error: wErr } = await student
    .from("counselor_weekly_availability")
    .select("counselor_id, day_of_week")
    .eq("institution_id", instId);

  console.log("Student RLS weekly:", weekly?.length, wErr?.message);
}
