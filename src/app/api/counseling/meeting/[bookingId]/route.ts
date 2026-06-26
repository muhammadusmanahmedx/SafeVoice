import { createClient } from "@/lib/supabase/server";
import { requireApiProfile } from "@/lib/auth/get-profile";
import { getJitsiDomain } from "@/lib/video/jitsi";
import { canJoinSession } from "@/lib/counseling/meeting-access";
import { getUserTimeZoneFromRequest, resolveTimeZone } from "@/lib/counseling/timezone";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;

  const auth = await requireApiProfile(["student", "counselor", "admin"]);
  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }
  const { profile } = auth;

  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("counseling_bookings")
    .select(`
      id, student_id, institution_id, meeting_room_name, status,
      slot:counseling_slots (slot_at, duration_minutes, counselor_id)
    `)
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return Response.json({ error: "Booking not found." }, { status: 404 });
  }

  const slot = booking.slot as {
    slot_at: string;
    duration_minutes: number;
    counselor_id: string;
  };

  const isStudent = profile.role === "student" && booking.student_id === profile.id;
  const isCounselor =
    (profile.role === "counselor" || profile.role === "admin") &&
    slot.counselor_id === profile.id;

  if (!isStudent && !isCounselor) {
    return Response.json({ error: "You are not a participant in this session." }, { status: 403 });
  }

  if (booking.status === "cancelled") {
    return Response.json({ error: "This session has been cancelled." }, { status: 410 });
  }

  const timeZone = resolveTimeZone(getUserTimeZoneFromRequest(req));

  if (!canJoinSession(slot.slot_at, slot.duration_minutes, undefined, timeZone)) {
    return Response.json(
      { error: "This session is only available on its scheduled day." },
      { status: 425 }
    );
  }

  if (!booking.meeting_room_name) {
    return Response.json(
      { error: "No meeting room has been created for this booking." },
      { status: 404 }
    );
  }

  const userName = profile.display_name ?? (isStudent ? "Student" : "Counselor");

  return Response.json({
    roomName: booking.meeting_room_name,
    jitsiDomain: getJitsiDomain(),
    userName,
    role: isStudent ? "student" : "counselor",
  });
}
