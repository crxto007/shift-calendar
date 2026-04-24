import { createClient } from "@supabase/supabase-js";
import { Shift, ShiftCategory } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export type { Shift };

export async function getShifts(): Promise<Shift[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("shifts")
    .select("id, date, start_time, end_time, title, location, category, notes")
    .order("date", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function addShift(shift: Omit<Shift, "id">): Promise<Shift> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase.from("shifts").insert(shift).select().single();
  if (error) throw error;
  return data;
}

export async function updateShift(id: string, updates: Partial<Shift>): Promise<Shift> {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("shifts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteShift(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.from("shifts").delete().eq("id", id);
  if (error) throw error;
}

export async function getShiftCategories(): Promise<ShiftCategory[]> {
  return ["work", "personal", "urgent", "meeting", "off", "other"];
}

export const ICS_FEED_URL = supabaseUrl
  ? `${supabaseUrl}/functions/v1/ics-feed`
  : "https://your-project.supabase.co/functions/v1/ics-feed";
