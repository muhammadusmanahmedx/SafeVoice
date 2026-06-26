import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { CounselingPageView } from "@/components/student/counseling-page-view";
import type { WeeklyAvailabilityRange } from "@/lib/counseling/availability-frames";

export default async function CounselingPage() {
  const profile = await requireProfile(["student"]);
  const supabase = await createClient();

  const now = new Date().toISOString();

  const [{ data: allSlots }, { data: bookings }, { data: weeklyRows }] = await Promise.all([
    supabase
      .from("counseling_slots")
      .select(`
        id, slot_at, duration_minutes, counselor_id,
        counselor:profiles (display_name)
      `)
      .eq("institution_id", profile.institution_id)
      .gte("slot_at", now)
      .order("slot_at", { ascending: true }),
    supabase
      .from("counseling_bookings")
      .select(`
        id, topic, status, created_at,
        slot:counseling_slots (
          id, slot_at, duration_minutes, counselor_id,
          counselor:profiles (display_name)
        )
      `)
      .eq("student_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("counselor_weekly_availability")
      .select(`
        counselor_id, day_of_week, start_time, end_time,
        counselor:profiles (display_name)
      `)
      .eq("institution_id", profile.institution_id),
  ]);

  const bookedSlotIds = new Set(
    (bookings ?? [])
      .filter((b) => b.status === "booked")
      .map((b) => (b.slot as { id: string }).id)
  );

  const availableSlots = (allSlots ?? [])
    .filter((s) => !bookedSlotIds.has(s.id))
    .map((s) => ({
      id: s.id,
      counselor_id: s.counselor_id,
      slot_at: s.slot_at,
      duration_minutes: s.duration_minutes,
      counselor_name:
        (s.counselor as { display_name: string | null } | null)?.display_name ??
        "Counselor",
    }));

  const myBookings = (bookings ?? [])
    .filter((b) => b.slot)
    .map((b) => {
      const slot = b.slot as {
        id: string;
        slot_at: string;
        duration_minutes: number;
        counselor_id: string;
        counselor: { display_name: string | null } | null;
      };
      return {
        id: b.id,
        topic: b.topic,
        status: b.status,
        created_at: b.created_at,
        slot: {
          id: slot.id,
          counselor_id: slot.counselor_id,
          slot_at: slot.slot_at,
          duration_minutes: slot.duration_minutes,
          counselor_name: slot.counselor?.display_name ?? "Counselor",
        },
      };
    });

  const weeklyRanges: WeeklyAvailabilityRange[] = (weeklyRows ?? []).map((r) => ({
    counselor_id: r.counselor_id,
    counselor_name:
      (r.counselor as { display_name: string | null } | null)?.display_name ?? "Counselor",
    day_of_week: r.day_of_week,
    start_time: r.start_time,
    end_time: r.end_time,
  }));

  return (
    <CounselingPageView
      availableSlots={availableSlots}
      weeklyRanges={weeklyRanges}
      myBookings={myBookings}
    />
  );
}
