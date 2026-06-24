"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { generateFacultyCode, toggleFacultyActive } from "@/lib/actions/admin";
import { formatDate } from "@/lib/utils";

interface FacultyManagementProps {
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

export function FacultyManagement({ faculty, codes }: FacultyManagementProps) {
  const [newCode, setNewCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerateCode() {
    setLoading(true);
    const result = await generateFacultyCode();
    if (result.code) setNewCode(result.code);
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Registration Codes</h2>
          <Button onClick={handleGenerateCode} disabled={loading}>
            {loading ? "Generating..." : "Generate Code"}
          </Button>
        </div>
        {newCode && (
          <Card className="mt-4 border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">New faculty code (share securely):</p>
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
                  <Badge variant="secondary">Used</Badge>
                ) : (
                  <Badge variant="outline">Available</Badge>
                )}
                <span className="text-xs text-muted-foreground">{formatDate(code.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Faculty Accounts</h2>
        <div className="mt-4 space-y-2">
          {faculty.map((f) => (
            <div key={f.id} className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
              <div>
                <p className="font-medium">{f.display_name ?? "Unnamed"}</p>
                <p className="text-xs text-muted-foreground">Joined {formatDate(f.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={f.is_active ? "default" : "destructive"}>
                  {f.is_active ? "Active" : "Disabled"}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFacultyActive(f.id, !f.is_active)}
                >
                  {f.is_active ? "Disable" : "Enable"}
                </Button>
              </div>
            </div>
          ))}
          {faculty.length === 0 && (
            <p className="text-sm text-muted-foreground">No faculty registered yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
