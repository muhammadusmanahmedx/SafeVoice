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

interface WeeklyHoursEditorProps {
  initialRows: { day_of_week: number; start_time: string; end_time: string }[];
  initialDuration: number;
}

function defaultRange(): TimeRange {
  return { start: "09:00", end: "17:00" };
}

export function WeeklyHoursEditor({ initialRows, initialDuration }: WeeklyHoursEditorProps) {
  const router = useRouter();
  const [schedule, setSchedule] = useState<WeeklySchedule>(() =>
    initialRows.length > 0 ? scheduleFromDbRows(initialRows) : emptySchedule()
  );
  const [duration, setDuration] = useState(String(initialDuration));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [copyFromDay, setCopyFromDay] = useState<number | null>(null);
  const [copyTargets, setCopyTargets] = useState<Set<number>>(new Set());

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
            <h2 className="text-base font-semibold">Weekly hours</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Set when you are typically available for counseling sessions each week.
          </p>
        </div>
        <div className="space-y-1.5 sm:w-44">
          <Label className="text-xs">Session length</Label>
          <Select value={duration} onValueChange={(v) => { setDuration(v); setSaved(false); }}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        {WEEKDAYS.map(({ day, letter, name }) => {
          const ranges = schedule[day];
          const overlaps = getOverlappingIndices(ranges);
          const isCopyOpen = copyFromDay === day;

          return (
            <div
              key={day}
              className="relative flex gap-3 border-b border-border/60 py-4 last:border-0"
            >
              {/* Day badge */}
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#193852] text-sm font-semibold text-white"
                title={name}
              >
                {letter}
              </div>

              {/* Time ranges */}
              <div className="min-w-0 flex-1 space-y-2">
                {ranges.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => addRange(day)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Unavailable
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
                          title="Remove"
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
                              title="Add another time range"
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
                                title="Copy times to other days"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>

                              {isCopyOpen && (
                                <div className="absolute right-0 top-9 z-50 w-56 rounded-xl border border-border bg-card p-3 shadow-lg">
                                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    Copy times to…
                                  </p>
                                  <div className="space-y-1">
                                    {WEEKDAYS.map(({ day: d, name: dayName }) => (
                                      <label
                                        key={d}
                                        className={cn(
                                          "flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-muted",
                                          d === day && "opacity-50"
                                        )}
                                      >
                                        <span>{dayName}</span>
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
                                    Apply
                                  </Button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      {overlaps.has(index) && (
                        <p className="mt-1 text-xs text-amber-600">
                          Times overlap with another set of times.
                        </p>
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
          {loading ? "Saving…" : saved ? "Saved!" : "Save weekly hours"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Student bookable slots are generated for the next 8 weeks when you save.
        </p>
      </div>
    </div>
  );
}
