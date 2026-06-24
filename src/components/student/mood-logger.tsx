"use client";

import { useState } from "react";
import { MOOD_OPTIONS } from "@/types";
import type { MoodLevel } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { logMood } from "@/lib/actions/mood";
import { cn } from "@/lib/utils";

export function MoodLogger() {
  const [selected, setSelected] = useState<MoodLevel | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit() {
    if (!selected) return;
    setLoading(true);
    await logMood(selected, note);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-3">
        {MOOD_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSelected(option.value)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all",
              selected === option.value
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-transparent bg-muted/50 hover:bg-muted"
            )}
          >
            <span className="text-3xl">{option.emoji}</span>
            <span className="text-xs font-medium">{option.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="mood-note">What contributed to today&apos;s mood? (optional)</Label>
        <Textarea
          id="mood-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Share anything you'd like..."
        />
      </div>

      <Button onClick={handleSubmit} disabled={!selected || loading} className="w-full sm:w-auto">
        {loading ? "Saving..." : saved ? "Saved!" : "Log Mood"}
      </Button>
    </div>
  );
}
