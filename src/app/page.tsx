"use client";

import { useState, useEffect } from "react";
import { getShifts, addShift, deleteShift, ICS_FEED_URL, Shift } from "@/lib/supabase";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function Home() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: "",
    title: "",
    location: "",
  });

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  async function fetchShifts() {
    try {
      const data = await getShifts();
      setShifts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shifts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchShifts();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addShift(formData);
      setFormData({ date: "", start_time: "", end_time: "", title: "", location: "" });
      setShowForm(false);
      fetchShifts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add shift");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteShift(id);
      fetchShifts();
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

  function prevMonth() {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
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
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            ←
          </button>
          <h3 className="text-lg font-semibold text-zinc-900">{getMonthName(currentMonth)}</h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            →
          </button>
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

              return (
                <div
                  key={`${wi}-${di}`}
                  className={`min-h-24 p-2 border-b border-r border-zinc-200 ${!day ? "bg-zinc-50" : "bg-white"}`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : "text-zinc-700"}`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayShifts.map((shift) => (
                          <div
                            key={shift.id}
                            onClick={() => handleDelete(shift.id)}
                            className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate cursor-pointer hover:bg-blue-200"
                            title={`${shift.title} (click to delete)`}
                          >
                            {formatTime(shift.start_time)} {shift.title}
                          </div>
                        ))}
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
    <div className="min-h-screen bg-zinc-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Shift Calendar</h1>
          <p className="text-zinc-600 mt-2">Manage your shifts and subscribe to the calendar</p>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4 mb-6">
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
          <p className="text-sm text-zinc-500 mt-2">
            Subscribe in Apple Calendar: File → New Calendar Subscription → paste URL
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-zinc-900">Add New Shift</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? "Cancel" : "+ Add Shift"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 mb-6">
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
              <div className="col-span-2">
                <label className="block text-sm font-medium text-zinc-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Building A"
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
          <>
            {renderCalendar()}

            <div className="mt-6">
              <h2 className="text-xl font-semibold text-zinc-900 mb-4">All Shifts</h2>
              {shifts.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 bg-white rounded-xl border border-zinc-200">
                  No shifts yet. Add your first shift above.
                </div>
              ) : (
                <div className="space-y-3">
                  {shifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4 flex items-center justify-between"
                    >
                      <div>
                        <h3 className="font-semibold text-zinc-900">{shift.title}</h3>
                        <p className="text-sm text-zinc-600">
                          {new Date(shift.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} • {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                        </p>
                        {shift.location && <p className="text-sm text-zinc-500">{shift.location}</p>}
                      </div>
                      <button
                        onClick={() => handleDelete(shift.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
