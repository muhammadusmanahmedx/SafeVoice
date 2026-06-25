import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { MeetingAccessGate } from "@/components/counseling/meeting-access-gate";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Booking not found.</p>
        <Button asChild variant="outline">
          <Link href="/faculty/counseling">Back</Link>
        </Button>
      </div>
    );
  }

  if (booking.status === "cancelled") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">This session has been cancelled.</p>
        <Button asChild variant="outline">
          <Link href="/faculty/counseling">Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <MeetingAccessGate
      bookingId={bookingId}
      backHref="/faculty/counseling"
      slotAt={slot.slot_at}
      durationMinutes={slot.duration_minutes}
    />
  );
}
