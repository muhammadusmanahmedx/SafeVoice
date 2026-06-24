import { createClient } from "@/lib/supabase/server";
import { requireApiProfile } from "@/lib/auth/get-profile";
import { subDays } from "date-fns";
import Papa from "papaparse";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

const periodDays: Record<string, number> = {
  monthly: 30,
  quarterly: 90,
  annual: 365,
};

const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica" },
  title: { fontSize: 24, marginBottom: 8, fontWeight: "bold" },
  subtitle: { fontSize: 12, marginBottom: 24, color: "#666" },
  section: { fontSize: 14, fontWeight: "bold", marginTop: 16, marginBottom: 8 },
  row: { fontSize: 10, marginBottom: 4 },
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ period: string }> }
) {
  const auth = await requireApiProfile(["admin"]);
  if ("error" in auth) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }
  const profile = auth.profile;
  const { period } = await params;
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") ?? "csv";

  const days = periodDays[period] ?? 30;
  const since = subDays(new Date(), days).toISOString();
  const supabase = await createClient();

  const { data: cases } = await supabase
    .from("cases")
    .select("incident_type, severity, summary, location, status, created_at")
    .eq("institution_id", profile.institution_id)
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  const anonymized = (cases ?? []).map((c, i) => ({
    report_id: `RPT-${i + 1}`,
    incident_type: c.incident_type,
    severity: c.severity,
    summary: c.summary,
    location: c.location ?? "Not specified",
    status: c.status,
    date: new Date(c.created_at).toISOString().split("T")[0],
  }));

  const institutionName = profile.institutions?.name ?? "Institution";
  const reportTitle = `${institutionName} — ${period.charAt(0).toUpperCase() + period.slice(1)} Safeguarding Report`;

  if (format === "pdf") {
    const doc = (
      <Document>
        <Page size="A4" style={pdfStyles.page}>
          <Text style={pdfStyles.title}>{reportTitle}</Text>
          <Text style={pdfStyles.subtitle}>
            Anonymized report · Generated {new Date().toLocaleDateString()} · {anonymized.length} cases
          </Text>
          <Text style={pdfStyles.section}>Case Summary</Text>
          {anonymized.map((row) => (
            <View key={row.report_id} style={{ marginBottom: 12 }}>
              <Text style={pdfStyles.row}>
                {row.report_id} · {row.incident_type} · {row.severity} · {row.status}
              </Text>
              <Text style={pdfStyles.row}>{row.summary}</Text>
              <Text style={pdfStyles.row}>
                Location: {row.location} · Date: {row.date}
              </Text>
            </View>
          ))}
          {anonymized.length === 0 && (
            <Text style={pdfStyles.row}>No cases in this reporting period.</Text>
          )}
        </Page>
      </Document>
    );

    const buffer = await renderToBuffer(doc);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="safevoice-${period}-report.pdf"`,
      },
    });
  }

  const csv = Papa.unparse(anonymized);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="safevoice-${period}-report.csv"`,
    },
  });
}
