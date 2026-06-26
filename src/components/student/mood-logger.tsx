"use client";

import { useState } from "react";
import type { MoodLevel } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { logMood } from "@/lib/actions/mood";
import { useLanguage } from "@/components/providers/language-provider";
import { getMoodOptions } from "@/lib/i18n/labels";
import { cn } from "@/lib/utils";

export function MoodLogger() {
  const { t } = useLanguage();
  const moodOptions = getMoodOptions(t);
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
        {moodOptions.map((option) => (
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
        <Label htmlFor="mood-note">{t("student.mood.noteLabel")}</Label>
        <Textarea
          id="mood-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("student.mood.notePlaceholder")}
        />
      </div>

      <Button onClick={handleSubmit} disabled={!selected || loading} className="w-full sm:w-auto">
        {loading ? t("student.mood.saving") : saved ? t("student.mood.saved") : t("student.mood.logMood")}
      </Button>
    </div>
  );
}
