"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";

const periods = [
  { id: "monthly", label: "Monthly Report", desc: "Last 30 days of anonymized data" },
  { id: "quarterly", label: "Quarterly Report", desc: "Last 90 days of anonymized data" },
  { id: "annual", label: "Annual Report", desc: "Last 365 days of anonymized data" },
];

export function ReportsPanel() {
  function download(format: "csv" | "pdf", period: string) {
    window.open(`/api/reports/${period}?format=${format}`, "_blank");
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {periods.map((period) => (
        <Card key={period.id}>
          <CardHeader>
            <CardTitle className="text-lg">{period.label}</CardTitle>
            <CardDescription>{period.desc}</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => download("csv", period.id)}>
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => download("pdf", period.id)}>
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
