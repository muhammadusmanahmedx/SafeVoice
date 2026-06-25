import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { MeetingAccessGate } from "@/components/counseling/meeting-access-gate";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function StudentMeetingPage({ params }: PageProps) {
  const { bookingId } = await params;
  const profile = await requireProfile(["student"]);
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("counseling_bookings")
    .select(`
      id, status, meeting_room_name,
      slot:counseling_slots (slot_at, duration_minutes, faculty_id,
        faculty:profiles (display_name))
    `)
    .eq("id", bookingId)
    .eq("student_id", profile.id)
    .single();

  if (!booking) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Booking not found.</p>
        <Button asChild variant="outline">
          <Link href="/counseling">Back</Link>
        </Button>
      </div>
    );
  }

  const slot = booking.slot as {
    slot_at: string;
    duration_minutes: number;
    faculty: { display_name: string } | null;
  };

  if (booking.status === "cancelled") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">This session has been cancelled.</p>
        <Button asChild variant="outline">
          <Link href="/counseling">Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <MeetingAccessGate
      bookingId={bookingId}
      backHref="/counseling"
      slotAt={slot.slot_at}
      durationMinutes={slot.duration_minutes}
    />
  );
}
