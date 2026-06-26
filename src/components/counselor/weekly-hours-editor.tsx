"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveWeeklyAvailability } from "@/lib/actions/counseling";
import {
  WEEKDAYS,
  emptySchedule,
  getOverlappingIndices,
  scheduleFromDbRows,
  type TimeRange,
  type WeeklySchedule,
} from "@/lib/counseling/weekly-hours";
import { cn } from "@/lib/utils";
import { Copy, Plus, RefreshCw, X } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

interface WeeklyHoursEditorProps {
  initialRows: { day_of_week: number; start_time: string; end_time: string }[];
  initialDuration: number;
}

const WEEKDAY_NAME_KEYS = [
  "counselor.weeklyHours.weekdays.sunday",
  "counselor.weeklyHours.weekdays.monday",
  "counselor.weeklyHours.weekdays.tuesday",
  "counselor.weeklyHours.weekdays.wednesday",
  "counselor.weeklyHours.weekdays.thursday",
  "counselor.weeklyHours.weekdays.friday",
  "counselor.weeklyHours.weekdays.saturday",
] as const;

function defaultRange(): TimeRange {
  return { start: "09:00", end: "17:00" };
}

export function WeeklyHoursEditor({ initialRows, initialDuration }: WeeklyHoursEditorProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [schedule, setSchedule] = useState<WeeklySchedule>(() =>
    initialRows.length > 0 ? scheduleFromDbRows(initialRows) : emptySchedule()
  );
  const [duration, setDuration] = useState(String(initialDuration));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [copyFromDay, setCopyFromDay] = useState<number | null>(null);
  const [copyTargets, setCopyTargets] = useState<Set<number>>(new Set());

  function weekdayName(day: number) {
    return t(WEEKDAY_NAME_KEYS[day] ?? WEEKDAY_NAME_KEYS[0]);
  }

  function updateRange(day: number, index: number, field: "start" | "end", value: string) {
    setSchedule((prev) => {
      const next = { ...prev, [day]: [...prev[day]] };
      next[day][index] = { ...next[day][index], [field]: value };
      return next;
    });
    setSaved(false);
  }

  function addRange(day: number) {
    setSchedule((prev) => ({
      ...prev,
      [day]: [...prev[day], defaultRange()],
    }));
    setSaved(false);
  }

  function removeRange(day: number, index: number) {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
    setSaved(false);
  }

  function openCopy(day: number) {
    setCopyFromDay(day);
    setCopyTargets(new Set());
  }

  function toggleCopyTarget(day: number) {
    setCopyTargets((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }

  function applyCopy() {
    if (copyFromDay === null) return;
    const source = schedule[copyFromDay].map((r) => ({ ...r }));
    setSchedule((prev) => {
      const next = { ...prev };
      for (const day of Array.from(copyTargets)) {
        next[day] = source.map((r) => ({ ...r }));
      }
      return next;
    });
    setCopyFromDay(null);
    setCopyTargets(new Set());
    setSaved(false);
  }

  async function handleSave() {
    setLoading(true);
    setError(null);
    const result = await saveWeeklyAvailability(schedule, Number(duration));
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">{t("counselor.weeklyHours.title")}</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t("counselor.weeklyHours.description")}</p>
        </div>
        <div className="space-y-1.5 sm:w-44">
          <Label className="text-xs">{t("counselor.weeklyHours.sessionLength")}</Label>
          <Select value={duration} onValueChange={(v) => { setDuration(v); setSaved(false); }}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">{t("counselor.weeklyHours.minutes30")}</SelectItem>
              <SelectItem value="45">{t("counselor.weeklyHours.minutes45")}</SelectItem>
              <SelectItem value="60">{t("counselor.weeklyHours.minutes60")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        {WEEKDAYS.map(({ day, letter }) => {
          const ranges = schedule[day];
          const overlaps = getOverlappingIndices(ranges);
          const isCopyOpen = copyFromDay === day;
          const name = weekdayName(day);

          return (
            <div
              key={day}
              className="relative flex gap-3 border-b border-border/60 py-4 last:border-0"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#193852] text-sm font-semibold text-white"
                title={name}
              >
                {letter}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                {ranges.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => addRange(day)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {t("counselor.weeklyHours.unavailable")}
                  </button>
                ) : (
                  ranges.map((range, index) => (
                    <div key={index}>
                      <div className="flex flex-wrap items-center gap-2">
                        <Input
                          type="time"
                          value={range.start}
                          onChange={(e) => updateRange(day, index, "start", e.target.value)}
                          className={cn(
                            "h-9 w-[7.5rem] bg-muted/50",
                            overlaps.has(index) && "border-amber-500"
                          )}
                        />
                        <span className="text-muted-foreground">–</span>
                        <Input
                          type="time"
                          value={range.end}
                          onChange={(e) => updateRange(day, index, "end", e.target.value)}
                          className={cn(
                            "h-9 w-[7.5rem] bg-muted/50",
                            overlaps.has(index) && "border-amber-500"
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeRange(day, index)}
                          title={t("counselor.weeklyHours.remove")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        {index === 0 && (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground"
                              onClick={() => addRange(day)}
                              title={t("counselor.weeklyHours.addTimeRange")}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <div className="relative">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground"
                                onClick={() => (isCopyOpen ? setCopyFromDay(null) : openCopy(day))}
                                title={t("counselor.weeklyHours.copyTimesTo")}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>

                              {isCopyOpen && (
                                <div className="absolute right-0 top-9 z-50 w-56 rounded-xl border border-border bg-card p-3 shadow-lg">
                                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    {t("counselor.weeklyHours.copyTimesToLabel")}
                                  </p>
                                  <div className="space-y-1">
                                    {WEEKDAYS.map(({ day: d }) => (
                                      <label
                                        key={d}
                                        className={cn(
                                          "flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-muted",
                                          d === day && "opacity-50"
                                        )}
                                      >
                                        <span>{weekdayName(d)}</span>
                                        <input
                                          type="checkbox"
                                          disabled={d === day}
                                          checked={d === day || copyTargets.has(d)}
                                          onChange={() => d !== day && toggleCopyTarget(d)}
                                          className="h-4 w-4 rounded border-border"
                                        />
                                      </label>
                                    ))}
                                  </div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="mt-3 w-full"
                                    onClick={applyCopy}
                                    disabled={copyTargets.size === 0}
                                  >
                                    {t("common.apply")}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      {overlaps.has(index) && (
                        <p className="mt-1 text-xs text-amber-600">{t("counselor.weeklyHours.overlapWarning")}</p>
                      )}
                    </div>
                  ))
                )}
                {ranges.length === 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={() => addRange(day)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? t("counselor.weeklyHours.saving") : saved ? t("counselor.weeklyHours.saved") : t("counselor.weeklyHours.saveWeeklyHours")}
        </Button>
        <p className="text-xs text-muted-foreground">{t("counselor.weeklyHours.saveHint")}</p>
      </div>
    </div>
  );
}
