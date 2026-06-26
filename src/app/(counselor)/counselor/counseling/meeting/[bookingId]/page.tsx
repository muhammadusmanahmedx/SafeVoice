import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { CounselorMeetingView } from "@/components/counselor/counselor-meeting-view";

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function FacultyMeetingPage({ params }: PageProps) {
  const { bookingId } = await params;
  const profile = await requireProfile(["counselor", "admin"]);
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("counseling_bookings")
    .select(`
      id, status, meeting_room_name, student_id,
      slot:counseling_slots (slot_at, duration_minutes, counselor_id)
    `)
    .eq("id", bookingId)
    .single();

  const slot = booking?.slot as {
    slot_at: string;
    duration_minutes: number;
    counselor_id: string;
  } | null;

  if (!booking || slot?.counselor_id !== profile.id) {
    return <CounselorMeetingView bookingId={bookingId} slotAt="" durationMinutes={0} notFound />;
  }

  if (booking.status === "cancelled") {
    return <CounselorMeetingView bookingId={bookingId} slotAt="" durationMinutes={0} cancelled />;
  }

  return (
    <CounselorMeetingView
      bookingId={bookingId}
      slotAt={slot.slot_at}
      durationMinutes={slot.duration_minutes}
    />
  );
}
