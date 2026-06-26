import { createClient } from "@/lib/supabase/server";
import { requireApiProfile } from "@/lib/auth/get-profile";
import { formatDate } from "@/lib/utils";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  translate,
  type Locale,
} from "@/lib/i18n";
import { formatMessage, getIncidentTypeLabel, getRiskLevelLabel } from "@/lib/i18n/labels";

function getLocaleFromRequest(request: Request): Locale {
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]*)`));
    if (match) {
      try {
        const value = decodeURIComponent(match[1]);
        if (isLocale(value)) return value;
      } catch {
        /* fall through */
      }
    }
  }

  const acceptLang = request.headers.get("accept-language");
  if (acceptLang) {
    const first = acceptLang.split(",")[0]?.split("-")[0]?.trim().toLowerCase();
    if (first && isLocale(first)) return first;
  }

  return DEFAULT_LOCALE;
}

function formatSlotDateTime(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleString(locale === "ar" ? "ar" : locale === "hi" ? "hi-IN" : undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export async function GET(request: Request) {
  const locale = getLocaleFromRequest(request);
  const t = (key: string) => translate(locale, key);

  const auth = await requireApiProfile();
  if ("error" in auth) return Response.json({ error: auth.error }, { status: auth.status });
  const { profile } = auth;
  const supabase = await createClient();
  const notifications: object[] = [];

  if (profile.role === "student") {
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
        title: t("notifications.student.facultyRepliedTitle"),
        body: m.content.slice(0, 80) + (m.content.length > 80 ? "…" : ""),
        time: formatDate(m.created_at),
        read: false,
        href: `/cases?id=${m.case_id}`,
      });
    }

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
        title: t("notifications.student.counselingBookedTitle"),
        body: slot
          ? formatMessage(t("notifications.student.counselingBookedBody"), {
              datetime: formatSlotDateTime(slot.slot_at, locale),
            })
          : t("notifications.student.counselingBookedBodyFallback"),
        time: formatDate(b.created_at),
        read: false,
        href: "/counseling",
      });
    }

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
        title: t("notifications.student.identityRequestTitle"),
        body: t("notifications.student.identityRequestBody"),
        time: formatDate(r.created_at),
        read: r.status !== "pending",
        href: `/cases?id=${r.case_id}`,
      });
    }
  }

  if (profile.role === "faculty" || profile.role === "admin") {
    const { data: newCases } = await supabase
      .from("anonymous_cases" as "cases")
      .select("id, incident_type, severity, created_at, auto_alerted")
      .eq("institution_id", profile.institution_id)
      .eq("status", "new")
      .order("created_at", { ascending: false })
      .limit(10);

    for (const c of newCases ?? []) {
      const autoAlerted = (c as { auto_alerted?: boolean }).auto_alerted;
      const incidentLabel = getIncidentTypeLabel(t, c.incident_type);
      notifications.push({
        id: `case-${c.id}`,
        type: autoAlerted ? "risk_alert" : "new_case",
        title: autoAlerted
          ? t("notifications.faculty.highRiskAlertTitle")
          : t("notifications.faculty.newCaseTitle"),
        body: autoAlerted
          ? formatMessage(t("notifications.faculty.highRiskAlertBody"), { incidentType: incidentLabel })
          : formatMessage(t("notifications.faculty.newCaseBody"), {
              incidentType: incidentLabel,
              severity: getRiskLevelLabel(t, c.severity),
            }),
        time: formatDate(c.created_at),
        read: false,
        href: `/faculty/cases/${c.id}`,
      });
    }

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
        title: t("notifications.faculty.studentRepliedTitle"),
        body: m.content.slice(0, 80) + (m.content.length > 80 ? "…" : ""),
        time: formatDate(m.created_at),
        read: false,
        href: `/faculty/cases/${m.case_id}`,
      });
    }

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
          title: t("notifications.faculty.newBookingTitle"),
          body: slot
            ? formatMessage(t("notifications.faculty.newBookingBody"), {
                datetime: formatSlotDateTime(slot.slot_at, locale),
              })
            : t("notifications.faculty.newBookingBodyFallback"),
          time: formatDate(b.created_at),
          read: false,
          href: "/faculty/counseling",
        });
      }
    }

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
        title: accepted
          ? t("notifications.faculty.identityAcceptedTitle")
          : t("notifications.faculty.identityDeclinedTitle"),
        body: accepted
          ? t("notifications.faculty.identityAcceptedBody")
          : t("notifications.faculty.identityDeclinedBody"),
        time: formatDate(r.responded_at!),
        read: false,
        href: `/faculty/cases/${r.case_id}`,
      });
    }
  }

  const sorted = (notifications as Array<{ time: string }>)
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 20);

  return Response.json({ notifications: sorted });
}
