"use client";

import { CounselorManagement } from "@/components/admin/counselor-management";
import { useLanguage } from "@/components/providers/language-provider";

interface AdminCounselorsViewProps {
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

export function AdminCounselorsView({ counselors, codes }: AdminCounselorsViewProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("admin.counselors.pageTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.counselors.pageSubtitle")}</p>
      </div>
      <CounselorManagement counselors={counselors} codes={codes} />
    </div>
  );
}
