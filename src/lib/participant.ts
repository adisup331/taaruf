import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Hitung nomor peserta berikutnya untuk sebuah event.
 * Format: 3 digit berurutan (001, 002, ...). Unik per event.
 */
export async function nextParticipantNumber(
  supabase: SupabaseClient,
  eventId: string
): Promise<string> {
  const { data } = await supabase
    .from("EventAttendee")
    .select("participantNumber")
    .eq("eventId", eventId)

  let max = 0
  for (const row of data || []) {
    const n = parseInt((row as any).participantNumber || "", 10)
    if (!isNaN(n) && n > max) max = n
  }

  return String(max + 1)
}
