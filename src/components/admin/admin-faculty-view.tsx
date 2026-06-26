"use client";

import { FacultyManagement } from "@/components/admin/faculty-management";
import { useLanguage } from "@/components/providers/language-provider";

interface AdminFacultyViewProps {
  faculty: {
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

export function AdminFacultyView({ faculty, codes }: AdminFacultyViewProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("admin.faculty.pageTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("admin.faculty.pageSubtitle")}</p>
      </div>
      <FacultyManagement faculty={faculty} codes={codes} />
    </div>
  );
}
