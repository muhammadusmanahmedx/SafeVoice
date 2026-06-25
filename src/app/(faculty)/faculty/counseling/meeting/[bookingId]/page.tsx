import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { VideoMeetingRoom } from "@/components/counseling/video-meeting-room";
import { canJoinSession, joinOpensAt } from "@/lib/counseling/meeting-access";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

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

  if (!canJoinSession(slot.slot_at, slot.duration_minutes)) {
    const opensAt = joinOpensAt(slot.slot_at);
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-semibold">Session not yet open</h2>
        <p className="text-sm text-muted-foreground">
          You can join on{" "}
          <span className="font-medium">{format(opensAt, "EEE, MMM d")}</span>.
        </p>
        <Button asChild variant="outline">
          <Link href="/faculty/counseling">Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <VideoMeetingRoom bookingId={bookingId} backHref="/faculty/counseling" />
    </div>
  );
}
