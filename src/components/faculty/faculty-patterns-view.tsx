"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/providers/language-provider";
import { formatMessage, getIncidentTypeLabel } from "@/lib/i18n/labels";

interface FacultyPatternsViewProps {
  patterns: {
    location: string;
    incidentType: string;
    count: number;
  }[];
}

export function FacultyPatternsView({ patterns }: FacultyPatternsViewProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("faculty.patterns.pageTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("faculty.patterns.pageSubtitle")}</p>
      </div>

      <div className="space-y-3">
        {patterns.length > 0 ? (
          patterns.map((data) => (
            <Card key={`${data.location}::${data.incidentType}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{data.location}</CardTitle>
                  <Badge>
                    {formatMessage(t("faculty.patterns.reportsBadge"), { count: data.count })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t("faculty.patterns.issueType")} {getIncidentTypeLabel(t, data.incidentType)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatMessage(t("faculty.patterns.recurringDesc"), { count: data.count })}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">{t("faculty.patterns.empty")}</p>
        )}
      </div>
    </div>
  );
}
