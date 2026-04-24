"use client";

import { useCalendar } from "@/lib/CalendarContext";
import { useShifts } from "@/lib/useShifts";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function MiniMonthSidebar() {
  const { currentDate, selectedDate, goToDate } = useCalendar();
  const { shifts } = useShifts();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  const hasShiftsOnDate = (date: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
    return shifts.some((s) => s.date === dateStr);
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const monthName = currentDate.toLocaleString("en-US", { month: "short" });

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-zinc-900">
          {monthName} {year}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-[10px] font-medium text-zinc-400 py-1"
          >
            {day}
          </div>
        ))}

        {weeks.map((week, wi) =>
          week.map((day, di) => {
            const isToday = day === todayDate && isCurrentMonth;
            const hasShift = day ? hasShiftsOnDate(day) : false;
            const isSelected =
              selectedDate &&
              day === selectedDate.getDate() &&
              selectedDate.getMonth() === month &&
              selectedDate.getFullYear() === year;

            return (
              <button
                key={`${wi}-${di}`}
                onClick={() => day && goToDate(new Date(year, month, day))}
                disabled={!day}
                className={`
                  aspect-square flex flex-col items-center justify-center rounded-md text-xs
                  transition-colors
                  ${!day ? "text-zinc-300" : ""}
                  ${isToday ? "bg-blue-600 text-white font-semibold" : ""}
                  ${isSelected && !isToday ? "bg-blue-100" : ""}
                  ${day && !isToday && !isSelected ? "text-zinc-700 hover:bg-zinc-100" : ""}
                `}
              >
                <span>{day}</span>
                {hasShift && !isToday && (
                  <span className="w-1 h-1 rounded-full bg-blue-500 mt-0.5" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}