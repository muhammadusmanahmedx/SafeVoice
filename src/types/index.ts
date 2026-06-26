export type UserRole = "student" | "counselor" | "admin";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type RiskCategory =
  | "anxiety"
  | "bullying"
  | "harassment"
  | "academic_stress"
  | "mental_health"
  | "safety_concern"
  | "discrimination"
  | "other";

export type CaseStatus =
  | "new"
  | "in_progress"
  | "escalated"
  | "resolved"
  | "unsubstantiated";

export type ResourceType = "article" | "video" | "helpline" | "institution";

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface RiskAssessment {
  riskLevel: RiskLevel;
  category: RiskCategory;
  requiresAttention: boolean;
  summary: string;
}

export interface EscalationData {
  location: string;
  duration: string;
  peopleInvolved: "student" | "counselor" | "group" | "unknown";
  othersAffected: boolean;
}

export const MOOD_OPTIONS = [
  { value: 1 as MoodLevel, emoji: "😀", label: "Excellent" },
  { value: 2 as MoodLevel, emoji: "🙂", label: "Good" },
  { value: 3 as MoodLevel, emoji: "😐", label: "Neutral" },
  { value: 4 as MoodLevel, emoji: "☹️", label: "Struggling" },
  { value: 5 as MoodLevel, emoji: "😢", label: "Very Difficult" },
] as const;

export const RESOURCE_CATEGORIES = [
  "anxiety",
  "stress",
  "bullying",
  "confidence",
  "study_habits",
  "burnout",
  "mental_health",
] as const;

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  escalated: "Escalated",
  resolved: "Resolved",
  unsubstantiated: "Unsubstantiated",
};

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  low: "bg-risk-low/15 text-risk-low border-risk-low/30",
  medium: "bg-risk-medium/15 text-risk-medium border-risk-medium/30",
  high: "bg-risk-high/15 text-risk-high border-risk-high/30",
  critical: "bg-risk-critical/15 text-risk-critical border-risk-critical/30",
};
