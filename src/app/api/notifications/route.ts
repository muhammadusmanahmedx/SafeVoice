import { createClient } from "@/lib/supabase/server";
import { requireApiProfile } from "@/lib/auth/get-profile";
import { formatDate } from "@/lib/utils";

export async function GET() {
  const auth = await requireApiProfile();
  if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status });
  const { profile } = auth;
  const supabase = await createClient();
  const notifications: object[] = [];

  if (profile.role === "student") {
    // Faculty messages on student's cases
    const { data: msgs } = await supabase
      .from("case_messages")
      .select("id, content, created_at, case_id")
      .eq("sender_role", "faculty")
      .in(
        "case_id",
        (
          await supabase
            .from("cases")
            .select("id")
            .eq("student_id", profile.id)
        ).data?.map((c) => c.id) ?? []
      )
      .order("created_at", { ascending: false })
      .limit(10);

    for (const m of msgs ?? []) {
      notifications.push({
        id: `msg-${m.id}`,
        type: "message",
        title: "Faculty replied to your case",
        body: m.content.slice(0, 80) + (m.content.length > 80 ? "…" : ""),
        time: formatDate(m.created_at),
        read: false,
        href: `/cases?id=${m.case_id}`,
      });
    }

    // Counseling booking confirmations for student
    const { data: myBookings } = await supabase
      .from("counseling_bookings")
      .select("id, created_at, slot:counseling_slots(slot_at)")
      .eq("student_id", profile.id)
      .eq("status", "booked")
      .order("created_at", { ascending: false })
      .limit(5);

    for (const b of myBookings ?? []) {
      const slot = b.slot as { slot_at: string } | null;
      notifications.push({
        id: `bkg-${b.id}`,
        type: "counseling_booked",
        title: "Counseling session booked",
        body: slot
          ? `Your session is scheduled for ${new Date(slot.slot_at).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}.`
          : "Your counseling session has been confirmed.",
        time: formatDate(b.created_at),
        read: false,
        href: "/counseling",
      });
    }

    // Identity reveal requests targeting student
    const { data: revealReqs } = await supabase
      .from("identity_reveal_requests")
      .select("id, status, created_at, case_id")
      .in(
        "case_id",
        (
          await supabase
            .from("cases")
            .select("id")
            .eq("student_id", profile.id)
        ).data?.map((c) => c.id) ?? []
      )
      .order("created_at", { ascending: false })
      .limit(10);

    for (const r of revealReqs ?? []) {
      notifications.push({
        id: `rev-${r.id}`,
        type: "identity_request",
        title: "Identity reveal requested",
        body: "A faculty member has requested to know your identity for better support.",
        time: formatDate(r.created_at),
        read: r.status !== "pending",
        href: `/cases?id=${r.case_id}`,
      });
    }
  }

  if (profile.role === "faculty" || profile.role === "admin") {
    // New cases in institution
    const { data: newCases } = await supabase
      .from("anonymous_cases" as "cases")
      .select("id, incident_type, severity, created_at, auto_alerted")
      .eq("institution_id", profile.institution_id)
      .eq("status", "new")
      .order("created_at", { ascending: false })
      .limit(10);

    for (const c of newCases ?? []) {
      const autoAlerted = (c as { auto_alerted?: boolean }).auto_alerted;
      notifications.push({
        id: `case-${c.id}`,
        type: autoAlerted ? "risk_alert" : "new_case",
        title: autoAlerted ? "High-risk alert detected" : "New case submitted",
        body: autoAlerted
          ? `${c.incident_type.replace(/_/g, " ")} — AI auto-detected, review immediately`
          : `${c.incident_type.replace(/_/g, " ")} — severity: ${c.severity}`,
        time: formatDate(c.created_at),
        read: false,
        href: `/faculty/cases/${c.id}`,
      });
    }

    // Student messages on faculty's cases
    const { data: stuMsgs } = await supabase
      .from("case_messages")
      .select("id, content, created_at, case_id")
      .eq("sender_role", "student")
      .in(
        "case_id",
        (
          await supabase
            .from("anonymous_cases" as "cases")
            .select("id")
            .eq("institution_id", profile.institution_id)
        ).data?.map((c) => c.id) ?? []
      )
      .order("created_at", { ascending: false })
      .limit(10);

    for (const m of stuMsgs ?? []) {
      notifications.push({
        id: `smsg-${m.id}`,
        type: "message",
        title: "Student replied to a case",
        body: m.content.slice(0, 80) + (m.content.length > 80 ? "…" : ""),
        time: formatDate(m.created_at),
        read: false,
        href: `/faculty/cases/${m.case_id}`,
      });
    }

    // New counseling bookings on faculty's slots
    const { data: mySlots } = await supabase
      .from("counseling_slots")
      .select("id")
      .eq("faculty_id", profile.id);

    const mySlotIds = (mySlots ?? []).map((s) => s.id);
    if (mySlotIds.length > 0) {
      const { data: newBookings } = await supabase
        .from("counseling_bookings")
        .select("id, created_at, slot:counseling_slots(slot_at)")
        .in("slot_id", mySlotIds)
        .eq("status", "booked")
        .order("created_at", { ascending: false })
        .limit(5);

      for (const b of newBookings ?? []) {
        const slot = b.slot as { slot_at: string } | null;
        notifications.push({
          id: `fbkg-${b.id}`,
          type: "counseling_booking_received",
          title: "New counseling booking",
          body: slot
            ? `A student booked a session on ${new Date(slot.slot_at).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}.`
            : "A student has booked a counseling session with you.",
          time: formatDate(b.created_at),
          read: false,
          href: "/faculty/counseling",
        });
      }
    }

    // Identity reveal responses
    const { data: revealResp } = await supabase
      .from("identity_reveal_requests")
      .select("id, status, responded_at, case_id")
      .eq("requested_by", profile.id)
      .not("responded_at", "is", null)
      .order("responded_at", { ascending: false })
      .limit(10);

    for (const r of revealResp ?? []) {
      const accepted = r.status === "accepted";
      notifications.push({
        id: `rresp-${r.id}`,
        type: accepted ? "identity_accepted" : "identity_declined",
        title: accepted ? "Identity reveal accepted" : "Identity reveal declined",
        body: accepted
          ? "The student has agreed to share their identity. Check the case for details."
          : "The student has chosen to remain anonymous.",
        time: formatDate(r.responded_at!),
        read: false,
        href: `/faculty/cases/${r.case_id}`,
      });
    }
  }

  // Sort by time desc, cap at 20
  const sorted = (notifications as Array<{ time: string }>)
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 20);

  return Response.json({ notifications: sorted });
}
