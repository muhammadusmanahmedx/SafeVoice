import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { FacultyMeetingView } from "@/components/faculty/faculty-meeting-view";

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function FacultyMeetingPage({ params }: PageProps) {
  const { bookingId } = await params;
  const profile = await requireProfile(["faculty", "admin"]);
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("counseling_bookings")
    .select(`
      id, status, meeting_room_name, student_id,
      slot:counseling_slots (slot_at, duration_minutes, faculty_id)
    `)
    .eq("id", bookingId)
    .single();

  const slot = booking?.slot as {
    slot_at: string;
    duration_minutes: number;
    faculty_id: string;
  } | null;

  if (!booking || slot?.faculty_id !== profile.id) {
    return <FacultyMeetingView bookingId={bookingId} slotAt="" durationMinutes={0} notFound />;
  }

  if (booking.status === "cancelled") {
    return <FacultyMeetingView bookingId={bookingId} slotAt="" durationMinutes={0} cancelled />;
  }

  return (
    <FacultyMeetingView
      bookingId={bookingId}
      slotAt={slot.slot_at}
      durationMinutes={slot.duration_minutes}
    />
  );
}
