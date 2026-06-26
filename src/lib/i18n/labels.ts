import type { CaseStatus, MoodLevel } from "@/types";

type T = (key: string) => string;

export function formatMessage(template: string, params: Record<string, string | number>): string {
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    result = result.split(`{${key}}`).join(String(value));
  }
  return result;
}

export function getMoodLabel(t: T, value: MoodLevel): string {
  return t(`mood.level${value}`);
}

export function getCaseStatusLabel(t: T, status: CaseStatus): string {
  return t(`cases.status.${status}`);
}

export function getResourceCategoryLabel(t: T, category: string): string {
  const key = `resources.categories.${category}`;
  const translated = t(key);
  return translated === key ? category.replace(/_/g, " ") : translated;
}

export function getRiskLevelLabel(t: T, level: string): string {
  const key = `risk.${level}`;
  const translated = t(key);
  return translated === key ? level : translated;
}

export function getIncidentTypeLabel(t: T, type: string | null | undefined): string {
  if (!type) return t("common.unknown");
  const key = `incident.${type}`;
  const translated = t(key);
  return translated === key ? type.replace(/_/g, " ") : translated;
}

export const MOOD_EMOJIS: Record<MoodLevel, string> = {
  1: "😀",
  2: "🙂",
  3: "😐",
  4: "☹️",
  5: "😢",
};

export function getMoodOptions(t: T) {
  return ([1, 2, 3, 4, 5] as MoodLevel[]).map((value) => ({
    value,
    emoji: MOOD_EMOJIS[value],
    label: getMoodLabel(t, value),
  }));
}
