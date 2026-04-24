import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function formatIcsDateTime(date: string, time: string): string {
  const [year, month, day] = date.split("-");
  const [hour, minute] = time.split(":");
  return `${year}${month}${day}T${hour}${minute}00`;
}

function formatTimestamp(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hour = String(now.getUTCHours()).padStart(2, "0");
  const minute = String(now.getUTCMinutes()).padStart(2, "0");
  const second = String(now.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hour}${minute}${second}Z`;
}

serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("shifts")
    .select("id, date, start_time, end_time, title, location")
    .order("date", { ascending: true });

  if (error) {
    return new Response(error.message, {
      headers: { "Content-Type": "text/plain" },
      status: 500,
    });
  }

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Shift App//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Shifts",
  ];

  if (data && data.length > 0) {
    for (const shift of data) {
      const dtStart = formatIcsDateTime(shift.date, shift.start_time);
      const dtEnd = formatIcsDateTime(shift.date, shift.end_time);
      const uid = `${shift.id}@shifts`;
      const dtstamp = formatTimestamp();

      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${dtstamp}`);
      lines.push(`DTSTART;TZID=Europe/Berlin:${dtStart}`);
      lines.push(`DTEND;TZID=Europe/Berlin:${dtEnd}`);
      lines.push(`SUMMARY:${shift.title}`);
      lines.push(`LOCATION:${shift.location || ""}`);
      lines.push("BEGIN:VALARM");
      lines.push("TRIGGER:-PT60M");
      lines.push("ACTION:DISPLAY");
      lines.push(`DESCRIPTION:${shift.title}`);
      lines.push("END:VALARM");
      lines.push("END:VEVENT");
    }
  }

  lines.push("END:VCALENDAR");

  const body = lines.join("\r\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
    },
  });
});