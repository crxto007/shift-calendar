import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Shift = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  title: string;
  location: string | null;
};

export async function getShifts(): Promise<Shift[]> {
  const { data, error } = await supabase
    .from("shifts")
    .select("id, date, start_time, end_time, title, location")
    .order("date", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function addShift(shift: Omit<Shift, "id">): Promise<Shift> {
  const { data, error } = await supabase.from("shifts").insert(shift).select().single();
  if (error) throw error;
  return data;
}

export async function deleteShift(id: string): Promise<void> {
  const { error } = await supabase.from("shifts").delete().eq("id", id);
  if (error) throw error;
}

export const ICS_FEED_URL = `${supabaseUrl}/functions/v1/ics-feed`;
