"use server";

import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/get-profile";
import { revalidatePath } from "next/cache";
import { createMeetingRoomName } from "@/lib/video/jitsi";
import {
  type TimeRange,
  type WeeklySchedule,
  generateSlotTimes,
  getOverlappingIndices,
  timeToMinutes,
  WEEKS_AHEAD,
} from "@/lib/counseling/weekly-hours";

export type { TimeRange, WeeklySchedule };

export async function getWeeklyAvailability() {
  const profile = await requireProfile(["faculty", "admin"]);
  const supabase = await createClient();

  const { data } = await supabase
    .from("faculty_weekly_availability")
    .select("day_of_week, start_time, end_time, duration_minutes")
    .eq("faculty_id", profile.id)
    .order("day_of_week")
    .order("start_time");

  const duration = data?.[0]?.duration_minutes ?? 30;
  return { rows: data ?? [], duration };
}

export async function saveWeeklyAvailability(
  schedule: WeeklySchedule,
  durationMinutes: number
) {
  const profile = await requireProfile(["faculty", "admin"]);
  const supabase = await createClient();

  if (![30, 45, 60].includes(durationMinutes)) {
    return { error: "Session duration must be 30, 45, or 60 minutes." };
  }

  for (let day = 0; day <= 6; day++) {
    const ranges = schedule[day] ?? [];
    if (getOverlappingIndices(ranges).size > 0) {
      return { error: "Time ranges overlap on one or more days. Please fix before saving." };
    }
    for (const range of ranges) {
      if (!range.start || !range.end) {
        return { error: "All time ranges must have a start and end time." };
      }
      if (timeToMinutes(range.start) >= timeToMinutes(range.end)) {
        return { error: "End time must be after start time." };
      }
    }
  }

  await supabase
    .from("faculty_weekly_availability")
    .delete()
    .eq("faculty_id", profile.id);

  const inserts = [];
  for (let day = 0; day <= 6; day++) {
    for (const range of schedule[day] ?? []) {
      inserts.push({
        faculty_id: profile.id,
        institution_id: profile.institution_id,
        day_of_week: day,
        start_time: range.start,
        end_time: range.end,
        duration_minutes: durationMinutes,
      });
    }
  }

  if (inserts.length > 0) {
    const { error } = await supabase.from("faculty_weekly_availability").insert(inserts);
    if (error) return { error: error.message };
  }

  const syncResult = await syncCounselingSlotsFromWeekly(
    profile.id,
    profile.institution_id,
    schedule,
    durationMinutes
  );
  if (syncResult.error) return syncResult;

  revalidatePath("/faculty/counseling");
  revalidatePath("/counseling");
  return { success: true };
}

async function syncCounselingSlotsFromWeekly(
  facultyId: string,
  institutionId: string,
  schedule: WeeklySchedule,
  durationMinutes: number
) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: existingSlots } = await supabase
    .from("counseling_slots")
    .select("id, slot_at")
    .eq("faculty_id", facultyId)
    .gte("slot_at", now);

  const slotIds = (existingSlots ?? []).map((s) => s.id);

  const { data: booked } = slotIds.length
    ? await supabase
        .from("counseling_bookings")
        .select("slot_id")
        .in("slot_id", slotIds)
        .eq("status", "booked")
    : { data: [] };

  const bookedSlotIds = new Set((booked ?? []).map((b) => b.slot_id));
  const bookedSlotTimes = new Set(
    (existingSlots ?? [])
      .filter((s) => bookedSlotIds.has(s.id))
      .map((s) => new Date(s.slot_at).toISOString())
  );

  const unbookedIds = (existingSlots ?? [])
    .filter((s) => !bookedSlotIds.has(s.id))
    .map((s) => s.id);

  if (unbookedIds.length > 0) {
    await supabase.from("counseling_slots").delete().in("id", unbookedIds);
  }

  const targetTimes = generateSlotTimes(schedule, durationMinutes, WEEKS_AHEAD);
  const toInsert = targetTimes
    .filter((t) => !bookedSlotTimes.has(t.toISOString()))
    .map((t) => ({
      institution_id: institutionId,
      faculty_id: facultyId,
      slot_at: t.toISOString(),
      duration_minutes: durationMinutes,
    }));

  if (toInsert.length > 0) {
    const { error } = await supabase.from("counseling_slots").insert(toInsert);
    if (error) return { error: error.message };
  }

  return { success: true };
}

export async function bookCounselingSession(slotId: string, topic?: string) {
  const profile = await requireProfile(["student"]);
  const supabase = await createClient();

  const { data: slot } = await supabase
    .from("counseling_slots")
    .select("id, institution_id, slot_at")
    .eq("id", slotId)
    .eq("institution_id", profile.institution_id)
    .single();

  if (!slot) return { error: "Session slot not found." };
  if (new Date(slot.slot_at) <= new Date()) {
    return { error: "This slot has already passed." };
  }

  const { data: existing } = await supabase
    .from("counseling_bookings")
    .select("id")
    .eq("slot_id", slotId)
    .eq("status", "booked")
    .maybeSingle();

  if (existing) return { error: "This slot is no longer available." };

  const { data, error } = await supabase
    .from("counseling_bookings")
    .insert({
      slot_id: slotId,
      student_id: profile.id,
      institution_id: profile.institution_id,
      topic: topic?.trim() || null,
      status: "booked",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  const roomName = createMeetingRoomName(data.id);
  await supabase
    .from("counseling_bookings")
    .update({ meeting_room_name: roomName })
    .eq("id", data.id);

  revalidatePath("/counseling");
  revalidatePath("/faculty/counseling");
  revalidatePath("/dashboard");
  return { bookingId: data.id };
}

export async function completeCounselingSession(bookingId: string) {
  const profile = await requireProfile(["student", "faculty", "admin"]);
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("counseling_bookings")
    .select("id, student_id, slot:counseling_slots(faculty_id)")
    .eq("id", bookingId)
    .single();

  if (!booking) return { error: "Booking not found." };

  const slot = booking.slot as { faculty_id: string } | null;
  const isStudent = profile.role === "student" && booking.student_id === profile.id;
  const isFaculty =
    (profile.role === "faculty" || profile.role === "admin") &&
    slot?.faculty_id === profile.id;

  if (!isStudent && !isFaculty) return { error: "Unauthorized." };

  await supabase
    .from("counseling_bookings")
    .update({ status: "completed", meeting_ended_at: new Date().toISOString() })
    .eq("id", bookingId);

  revalidatePath("/counseling");
  revalidatePath("/faculty/counseling");
  return { success: true };
}

export async function cancelCounselingBooking(bookingId: string) {
  const profile = await requireProfile(["student"]);
  const supabase = await createClient();

  const { error } = await supabase
    .from("counseling_bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("student_id", profile.id)
    .neq("status", "cancelled");

  if (error) return { error: error.message };

  revalidatePath("/counseling");
  revalidatePath("/faculty/counseling");
  revalidatePath("/dashboard");
  return { success: true };
}
