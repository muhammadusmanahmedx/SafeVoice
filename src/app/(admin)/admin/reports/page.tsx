import { ReportsPanel } from "@/components/admin/reports-panel";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Generate anonymized safeguarding reports — no student identities included
        </p>
      </div>
      <ReportsPanel />
    </div>
  );
}
