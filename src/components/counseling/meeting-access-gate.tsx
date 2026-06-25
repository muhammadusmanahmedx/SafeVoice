"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VideoMeetingRoom } from "@/components/counseling/video-meeting-room";
import { canJoinSession, formatSessionDay } from "@/lib/counseling/meeting-access";

interface MeetingAccessGateProps {
  bookingId: string;
  backHref: string;
  slotAt: string;
  durationMinutes: number;
}

export function MeetingAccessGate({
  bookingId,
  backHref,
  slotAt,
  durationMinutes,
}: MeetingAccessGateProps) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (!canJoinSession(slotAt, durationMinutes, new Date(), timeZone)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-xl font-semibold">Session not yet open</h2>
        <p className="text-sm text-muted-foreground">
          You can join on{" "}
          <span className="font-medium">{formatSessionDay(slotAt, timeZone)}</span>.
        </p>
        <Button asChild variant="outline">
          <Link href={backHref}>Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <VideoMeetingRoom bookingId={bookingId} backHref={backHref} />
    </div>
  );
}
