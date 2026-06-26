import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const WEEKS_AHEAD = 8;

function timeToMinutes(time) {
  const [h, m] = time.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

function scheduleFromDbRows(rows) {
  const schedule = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  for (const row of rows) {
    schedule[row.day_of_week].push({
      start: row.start_time.slice(0, 5),
      end: row.end_time.slice(0, 5),
    });
  }
  return schedule;
}

function generateSlotTimes(schedule, durationMinutes, weeksAhead = WEEKS_AHEAD) {
  const slots = [];
  const now = new Date();
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);

  for (let d = 0; d < weeksAhead * 7; d++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + d);
    const dayOfWeek = date.getDay();
    for (const range of schedule[dayOfWeek] ?? []) {
      let cursor = timeToMinutes(range.start);
      const end = timeToMinutes(range.end);
      while (cursor + durationMinutes <= end) {
        const slot = new Date(date);
        slot.setHours(Math.floor(cursor / 60), cursor % 60, 0, 0);
        if (slot > now) slots.push(new Date(slot));
        cursor += durationMinutes;
      }
    }
  }
  return slots;
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

const { data: counselors } = await supabase
  .from("profiles")
  .select("id, institution_id, display_name, role")
  .in("role", ["counselor"]);

for (const counselor of counselors ?? []) {
  const { data: rows } = await supabase
    .from("counselor_weekly_availability")
    .select("day_of_week, start_time, end_time, duration_minutes")
    .eq("counselor_id", counselor.id);

  if (!rows?.length) {
    console.log(`Skip ${counselor.display_name ?? counselor.id}: no weekly hours`);
    continue;
  }

  const duration = rows[0].duration_minutes ?? 30;
  const times = generateSlotTimes(scheduleFromDbRows(rows), duration);
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("counseling_slots")
    .select("id, slot_at")
    .eq("counselor_id", counselor.id)
    .gte("slot_at", now);

  const existingSet = new Set((existing ?? []).map((s) => new Date(s.slot_at).toISOString()));
  const toInsert = times
    .filter((t) => !existingSet.has(t.toISOString()))
    .map((t) => ({
      institution_id: counselor.institution_id,
      counselor_id: counselor.id,
      slot_at: t.toISOString(),
      duration_minutes: duration,
    }));

  if (toInsert.length === 0) {
    console.log(`${counselor.display_name ?? counselor.role}: slots already up to date`);
    continue;
  }

  const { error } = await supabase.from("counseling_slots").insert(toInsert);
  console.log(
    error
      ? `${counselor.display_name}: failed — ${error.message}`
      : `${counselor.display_name ?? counselor.role}: added ${toInsert.length} slots`
  );
}
