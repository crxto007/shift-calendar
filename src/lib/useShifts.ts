"use client";

import { useState, useEffect, useCallback } from "react";
import { getShifts, addShift, updateShift, deleteShift, Shift } from "./supabase";

interface UseShiftsOptions {
  onError?: (error: string) => void;
}

export function useShifts({ onError }: UseShiftsOptions = {}) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchShifts = useCallback(async () => {
    try {
      const data = await getShifts();
      setShifts(data);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Failed to load shifts");
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const add = useCallback(async (shift: Omit<Shift, "id">) => {
    const tempId = `temp-${Date.now()}`;
    const tempShift: Shift = { id: tempId, ...shift };

    // Optimistic update
    setShifts((prev) => [...prev, tempShift].sort((a, b) => a.date.localeCompare(b.date)));

    try {
      const newShift = await addShift(shift);
      // Replace temp with actual
      setShifts((prev) =>
        prev.map((s) => (s.id === tempId ? newShift : s)).sort((a, b) => a.date.localeCompare(b.date))
      );
      return newShift;
    } catch (err) {
      // Rollback on error
      setShifts((prev) => prev.filter((s) => s.id !== tempId));
      const error = err instanceof Error ? err.message : "Failed to add shift";
      onError?.(error);
      throw err;
    }
  }, [onError]);

  const update = useCallback(async (id: string, updates: Partial<Shift>) => {
    const previousShifts = shifts;

    // Optimistic update
    setShifts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s)).sort((a, b) => a.date.localeCompare(b.date))
    );

    try {
      const updated = await updateShift(id, updates);
      setShifts((prev) =>
        prev.map((s) => (s.id === id ? updated : s)).sort((a, b) => a.date.localeCompare(b.date))
      );
      return updated;
    } catch (err) {
      // Rollback on error
      setShifts(previousShifts);
      const error = err instanceof Error ? err.message : "Failed to update shift";
      onError?.(error);
      throw err;
    }
  }, [shifts, onError]);

  const remove = useCallback(async (id: string) => {
    const previousShifts = shifts;

    // Optimistic update
    setShifts((prev) => prev.filter((s) => s.id !== id));

    try {
      await deleteShift(id);
    } catch (err) {
      // Rollback on error
      setShifts(previousShifts);
      const error = err instanceof Error ? err.message : "Failed to delete shift";
      onError?.(error);
      throw err;
    }
  }, [shifts, onError]);

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      const data = await getShifts();
      setShifts(data);
    } finally {
      setSyncing(false);
    }
  }, []);

  return {
    shifts,
    loading,
    syncing,
    add,
    update,
    remove,
    sync,
    refetch: fetchShifts,
  };
}