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

/**
 * Masukkan user ke event sebagai peserta terverifikasi + nomor otomatis.
 * Idempotent: kalau sudah terdaftar, hanya melengkapi nomor / verifikasi.
 * Retry kalau nomor bentrok dengan peserta lain yang daftar bersamaan.
 */
export async function joinEventVerified(
  supabase: SupabaseClient,
  eventId: string,
  userId: string
): Promise<{ participantNumber: string | null; error: string | null }> {
  let lastError: string | null = null

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: existing } = await supabase
      .from("EventAttendee")
      .select("id, participantNumber, isVerified")
      .eq("eventId", eventId)
      .eq("userId", userId)
      .maybeSingle()

    if (existing?.participantNumber && existing.isVerified) {
      return { participantNumber: existing.participantNumber, error: null }
    }

    const participantNumber = existing?.participantNumber || await nextParticipantNumber(supabase, eventId)

    const { error } = existing
      ? await supabase
          .from("EventAttendee")
          .update({ participantNumber, isVerified: true })
          .eq("id", existing.id)
      : await supabase
          .from("EventAttendee")
          .insert({ eventId, userId, participantNumber, isVerified: true, isCheckedIn: false })

    if (!error) return { participantNumber, error: null }

    lastError = error.message
    // 23505 = unique violation (nomor diambil orang lain / user sudah masuk barusan) -> coba lagi
    if (error.code !== "23505") break
  }

  return { participantNumber: null, error: lastError }
}
