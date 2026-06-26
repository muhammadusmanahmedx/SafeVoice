"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

const PERIOD_KEYS = [
  { id: "monthly", labelKey: "admin.reports.monthly", descKey: "admin.reports.monthlyDesc" },
  { id: "quarterly", labelKey: "admin.reports.quarterly", descKey: "admin.reports.quarterlyDesc" },
  { id: "annual", labelKey: "admin.reports.annual", descKey: "admin.reports.annualDesc" },
] as const;

export function ReportsPanel() {
  const { t } = useLanguage();

  function download(format: "csv" | "pdf", period: string) {
    window.open(`/api/reports/${period}?format=${format}`, "_blank");
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {PERIOD_KEYS.map((period) => (
        <Card key={period.id}>
          <CardHeader>
            <CardTitle className="text-lg">{t(period.labelKey)}</CardTitle>
            <CardDescription>{t(period.descKey)}</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => download("csv", period.id)}>
              <Download className="mr-2 h-4 w-4" />
              {t("admin.reports.csv")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => download("pdf", period.id)}>
              <FileText className="mr-2 h-4 w-4" />
              {t("admin.reports.pdf")}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
