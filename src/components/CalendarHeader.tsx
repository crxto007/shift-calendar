"use client";

import { useCalendar } from "@/lib/CalendarContext";
import { CalendarViewMode } from "@/lib/types";

const VIEW_LABELS: Record<CalendarViewMode, string> = {
  day: "Day",
  week: "Week",
  month: "Month",
};

export function CalendarHeader() {
  const { currentDate, viewMode, setViewMode, navigatePrev, navigateNext, navigateToday } =
    useCalendar();

  const monthYear = currentDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-white">
      <div className="flex items-center gap-2">
        <button
          onClick={navigatePrev}
          className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          aria-label="Previous"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={navigateNext}
          className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          aria-label="Next"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          onClick={navigateToday}
          className="px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
        >
          Today
        </button>
      </div>

      <h2 className="text-lg font-semibold text-zinc-900">{monthYear}</h2>

      <div className="flex items-center gap-1 bg-zinc-100 rounded-lg p-1">
        {(Object.keys(VIEW_LABELS) as CalendarViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === mode
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {VIEW_LABELS[mode]}
          </button>
        ))}
      </div>
    </header>
  );
}