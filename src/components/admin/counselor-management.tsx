"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { generateCounselorCode, toggleCounselorActive } from "@/lib/actions/admin";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";
import { formatMessage } from "@/lib/i18n/labels";

interface CounselorManagementProps {
  counselors: {
    id: string;
    display_name: string | null;
    is_active: boolean;
    created_at: string;
  }[];
  codes: {
    id: string;
    code: string;
    expires_at: string | null;
    used_by: string | null;
    created_at: string;
  }[];
}

export function CounselorManagement({ counselors, codes }: CounselorManagementProps) {
  const { t } = useLanguage();
  const [newCode, setNewCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerateCode() {
    setLoading(true);
    const result = await generateCounselorCode();
    if (result.code) setNewCode(result.code);
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("admin.counselors.registrationCodes")}</h2>
          <Button onClick={handleGenerateCode} disabled={loading}>
            {loading ? t("admin.counselors.generating") : t("admin.counselors.generateCode")}
          </Button>
        </div>
        {newCode && (
          <Card className="mt-4 border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{t("admin.counselors.newCodeLabel")}</p>
              <p className="mt-1 font-mono text-lg font-bold">{newCode}</p>
            </CardContent>
          </Card>
        )}
        <div className="mt-4 space-y-2">
          {codes.map((code) => (
            <div key={code.id} className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
              <span className="font-mono">{code.code}</span>
              <div className="flex items-center gap-2">
                {code.used_by ? (
                  <Badge variant="secondary">{t("common.used")}</Badge>
                ) : (
                  <Badge variant="outline">{t("common.available")}</Badge>
                )}
                <span className="text-xs text-muted-foreground">{formatDate(code.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">{t("admin.counselors.counselorAccounts")}</h2>
        <div className="mt-4 space-y-2">
          {counselors.map((f) => (
            <div key={f.id} className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
              <div>
                <p className="font-medium">{f.display_name ?? t("common.unnamed")}</p>
                <p className="text-xs text-muted-foreground">
                  {formatMessage(t("admin.counselors.joined"), { date: formatDate(f.created_at) })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={f.is_active ? "default" : "destructive"}>
                  {f.is_active ? t("common.active") : t("common.disabled")}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleCounselorActive(f.id, !f.is_active)}
                >
                  {f.is_active ? t("common.disable") : t("common.enable")}
                </Button>
              </div>
            </div>
          ))}
          {counselors.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("admin.counselors.noCounselors")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
