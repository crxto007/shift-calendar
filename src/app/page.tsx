"use client";

import { useState } from "react";
import { CalendarProvider, useCalendar } from "@/lib/CalendarContext";
import { useShifts } from "@/lib/useShifts";
import { CalendarHeader } from "@/components/CalendarHeader";
import { MiniMonthSidebar } from "@/components/MiniMonthSidebar";
import { ICS_FEED_URL } from "@/lib/supabase";
import type { Shift } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function CalendarView() {
  const { currentDate, selectedDate, setSelectedDate } = useCalendar();
  const { shifts, loading, add, remove, syncing } = useShifts({
    onError: (msg) => console.error(msg),
  });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: "",
    title: "",
    location: "",
    category: "work" as const,
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await add(formData);
      setFormData({ date: "", start_time: "", end_time: "", title: "", location: "", category: "work", notes: "" });
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add shift");
    }
  }

  async function handleDelete(id: string) {
    try {
      await remove(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete shift");
    }
  }

  function copyFeedUrl() {
    navigator.clipboard.writeText(ICS_FEED_URL);
  }

  function formatTime(timeStr: string) {
    const [hours, minutes] = timeStr.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  function getShiftsForDate(dateStr: string) {
    return shifts.filter((s) => s.date === dateStr);
  }

  function getMonthName(month: number) {
    return new Date(currentYear, month).toLocaleString("en-US", { month: "long", year: "numeric" });
  }

  function renderCalendar() {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const weeks: (number | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden flex-1">
        <div className="p-4 border-b border-zinc-200">
          <h3 className="text-lg font-semibold text-zinc-900">{getMonthName(currentMonth)}</h3>
        </div>

        <div className="grid grid-cols-7">
          {WEEKDAYS.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-zinc-500 bg-zinc-50 border-b border-zinc-200">
              {day}
            </div>
          ))}

          {weeks.map((week, wi) =>
            week.map((day, di) => {
              const dateStr = day ? `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : null;
              const dayShifts = dateStr ? getShiftsForDate(dateStr) : [];
              const isToday = dateStr === new Date().toISOString().split("T")[0];
              const isSelected = selectedDate && dateStr === selectedDate.toISOString().split("T")[0];

              return (
                <div
                  key={`${wi}-${di}`}
                  onClick={() => dateStr && setSelectedDate(new Date(dateStr))}
                  className={`min-h-24 p-2 border-b border-r border-zinc-200 cursor-pointer transition-colors ${
                    !day ? "bg-zinc-50" : isSelected ? "bg-blue-50" : "bg-white hover:bg-zinc-50"
                  }`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : "text-zinc-700"}`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayShifts.slice(0, 3).map((shift) => {
                          const colors = CATEGORY_COLORS[shift.category] || CATEGORY_COLORS.other;
                          return (
                            <div
                              key={shift.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(shift.id);
                              }}
                              className={`text-xs p-1 ${colors.bg} ${colors.text} rounded truncate cursor-pointer hover:opacity-80`}
                              title={`${shift.title} (click to delete)`}
                            >
                              {formatTime(shift.start_time)} {shift.title}
                            </div>
                          );
                        })}
                        {dayShifts.length > 3 && (
                          <div className="text-xs text-zinc-500">+{dayShifts.length - 3} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-8 px-4">
      <div className="max-w-6xl mx-auto flex gap-6">
        <div className="w-64 shrink-0">
          <MiniMonthSidebar />
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <CalendarHeader />

          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-zinc-900">iCal Feed URL</h2>
                <p className="text-sm text-zinc-500 truncate max-w-md">{ICS_FEED_URL}</p>
              </div>
              <button
                onClick={copyFeedUrl}
                className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-zinc-900">
              {syncing ? "Syncing..." : "Shifts"}
            </h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showForm ? "Cancel" : "+ Add Shift"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Morning Shift"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="urgent">Urgent</option>
                    <option value="meeting">Meeting</option>
                    <option value="off">Off</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Building A"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes..."
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Shift
              </button>
            </form>
          )}

          {loading ? (
            <div className="text-center py-12 text-zinc-500">Loading...</div>
          ) : (
            renderCalendar()
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <CalendarProvider>
      <CalendarView />
    </CalendarProvider>
  );
}