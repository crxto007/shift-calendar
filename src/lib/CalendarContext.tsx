"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { Shift, CalendarViewMode } from "./types";

interface CalendarState {
  currentDate: Date;
  selectedDate: Date | null;
  viewMode: CalendarViewMode;
}

interface CalendarContextValue extends CalendarState {
  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date | null) => void;
  setViewMode: (mode: CalendarViewMode) => void;
  navigatePrev: () => void;
  navigateNext: () => void;
  navigateToday: () => void;
  goToDate: (date: Date) => void;
}

const CalendarContext = createContext<CalendarContextValue | null>(null);

export function CalendarProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");

  const navigatePrev = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewMode === "month") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (viewMode === "week") {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setDate(newDate.getDate() - 1);
      }
      return newDate;
    });
  }, [viewMode]);

  const navigateNext = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewMode === "month") {
        newDate.setMonth(newDate.getMonth() + 1);
      } else if (viewMode === "week") {
        newDate.setDate(newDate.getDate() + 7);
      } else {
        newDate.setDate(newDate.getDate() + 1);
      }
      return newDate;
    });
  }, [viewMode]);

  const navigateToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goToDate = useCallback((date: Date) => {
    setCurrentDate(date);
    setSelectedDate(date);
  }, []);

  return (
    <CalendarContext.Provider
      value={{
        currentDate,
        selectedDate,
        viewMode,
        setCurrentDate,
        setSelectedDate,
        setViewMode,
        navigatePrev,
        navigateNext,
        navigateToday,
        goToDate,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar(): CalendarContextValue {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
}

export function useCalendarState(): Omit<CalendarState, "shifts"> {
  const context = useCalendar();
  const { currentDate, selectedDate, viewMode } = context;
  return { currentDate, selectedDate, viewMode };
}