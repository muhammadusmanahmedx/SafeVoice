import { requireProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { WeeklyHoursEditor } from "@/components/faculty/weekly-hours-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { canJoinSession, formatSessionDay, isBookingActive } from "@/lib/counseling/meeting-access";
import { getUserTimeZoneFromCookies, resolveTimeZone } from "@/lib/counseling/timezone";
import Link from "next/link";
import { Calendar, User, Video } from "lucide-react";

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

  const upcomingBookings = (bookings ?? []).filter((b) => {
    const slot = b.slot as { slot_at: string } | null;
    return slot && isBookingActive(slot.slot_at, undefined, timeZone);
  });

  const initialDuration = weeklyRows?.[0]?.duration_minutes ?? 30;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Counseling</h1>
        <p className="text-sm text-muted-foreground">
          View student bookings and manage your weekly availability
        </p>
      </div>

      <Tabs defaultValue="bookings">
        <TabsList>
          <TabsTrigger value="bookings">
            Student Bookings
            {upcomingBookings.length > 0 && (
              <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                {upcomingBookings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="availability">Weekly Hours</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="mt-6 space-y-3">
          {upcomingBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No upcoming bookings on your slots yet.
            </p>
          ) : (
            upcomingBookings.map((booking) => {
              const slot = booking.slot as {
                slot_at: string;
                duration_minutes: number;
              };
              const studentName = studentMap.get(booking.student_id) ?? "Student";
              const joinable = canJoinSession(slot.slot_at, slot.duration_minutes, undefined, timeZone);
              return (
                <div
                  key={booking.id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(slot.slot_at).toLocaleString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {" · "}
                        {slot.duration_minutes} min
                      </p>
                      {booking.topic && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Topic: {booking.topic}
                        </p>
                      )}
                      {!joinable && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Join available on {formatSessionDay(slot.slot_at, timeZone)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {joinable ? (
                      <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        <Link href={`/faculty/counseling/meeting/${booking.id}`}>
                          <Video className="mr-1.5 h-3.5 w-3.5" />
                          Join session
                        </Link>
                      </Button>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <User className="h-3 w-3" />
                        Booked
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="availability" className="mt-6">
          <WeeklyHoursEditor
            initialRows={weeklyRows ?? []}
            initialDuration={initialDuration}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
