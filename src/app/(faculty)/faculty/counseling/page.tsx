import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { FacultyCounselingView } from "@/components/faculty/faculty-counseling-view";
import { isBookingActive } from "@/lib/counseling/meeting-access";
import { getUserTimeZoneFromCookies, resolveTimeZone } from "@/lib/counseling/timezone";

export default async function FacultyCounselingPage() {
  const profile = await requireProfile(["faculty", "admin"]);
  const supabase = await createClient();

  const [{ data: weeklyRows }, { data: bookings }] = await Promise.all([
    supabase
      .from("faculty_weekly_availability")
      .select("day_of_week, start_time, end_time, duration_minutes")
      .eq("faculty_id", profile.id)
      .order("day_of_week")
      .order("start_time"),
    supabase
      .from("counseling_bookings")
      .select(`
        id, topic, status, created_at, student_id, slot_id, meeting_room_name,
        slot:counseling_slots!inner (slot_at, duration_minutes, faculty_id)
      `)
      .eq("counseling_slots.faculty_id", profile.id)
      .neq("status", "cancelled")
      .order("created_at", { ascending: false }),
  ]);

  const studentIds = Array.from(new Set((bookings ?? []).map((b) => b.student_id)));
  const { data: students } = studentIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", studentIds)
    : { data: [] };
  const studentMap = new Map((students ?? []).map((s) => [s.id, s.display_name]));

  const timeZone = resolveTimeZone(getUserTimeZoneFromCookies());

  const upcomingBookings = (bookings ?? [])
    .filter((b) => {
      const slot = b.slot as { slot_at: string } | null;
      return slot && isBookingActive(slot.slot_at, undefined, timeZone);
    })
    .map((booking) => {
      const slot = booking.slot as { slot_at: string; duration_minutes: number };
      return {
        id: booking.id,
        topic: booking.topic,
        studentName: studentMap.get(booking.student_id) ?? "",
        slotAt: slot.slot_at,
        durationMinutes: slot.duration_minutes,
      };
    });

  const initialDuration = weeklyRows?.[0]?.duration_minutes ?? 30;

  return (
    <FacultyCounselingView
      upcomingBookings={upcomingBookings}
      weeklyRows={weeklyRows ?? []}
      initialDuration={initialDuration}
      timeZone={timeZone}
    />
  );
}
