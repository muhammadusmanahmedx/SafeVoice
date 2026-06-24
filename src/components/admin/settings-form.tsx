"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateInstitutionSettings } from "@/lib/actions/admin";

interface SettingsFormProps {
  institutionName: string;
}

export function SettingsForm({ institutionName }: SettingsFormProps) {
  const [name, setName] = useState(institutionName);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    await updateInstitutionSettings(name);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="glass-card max-w-lg space-y-4 p-6">
      <div className="space-y-2">
        <Label htmlFor="institution">Institution Name</Label>
        <Input id="institution" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <Button onClick={handleSave}>{saved ? "Saved!" : "Save Settings"}</Button>
    </div>
  );
}
