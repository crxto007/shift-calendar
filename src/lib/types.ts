export type ShiftCategory = "work" | "personal" | "urgent" | "meeting" | "off" | "other";

export const CATEGORY_COLORS: Record<ShiftCategory, { bg: string; text: string; border: string }> = {
  work: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
  personal: { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
  urgent: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  meeting: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
  off: { bg: "bg-zinc-100", text: "text-zinc-800", border: "border-zinc-300" },
  other: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
};

export interface Shift {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  title: string;
  location: string | null;
  category: ShiftCategory;
  notes: string | null;
}

export type CalendarViewMode = "day" | "week" | "month";

export type SyncStatus = "idle" | "syncing" | "error" | "synced";
