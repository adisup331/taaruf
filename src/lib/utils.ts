import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Label tampilan gender: nilai DB tetap IKHWAN/AKHWAT */
export function genderLabel(gender?: string | null) {
  if (gender === "IKHWAN") return "Laki-Laki"
  if (gender === "AKHWAT") return "Perempuan"
  return gender || "-"
}

/** Label tampilan status TaarufRequest (sisi admin — semua status) */
export function statusLabel(status?: string | null) {
  if (status === "PENDING") return "Menunggu"
  if (status === "APPROVED") return "Sedang Taaruf"
  if (status === "LANJUT") return "Lanjut"
  if (status === "SL") return "Lamaran"
  if (status === "TIDAK_LANJUT") return "Tidak Lanjut"
  return status || "-"
}

/**
 * Label status untuk SISI MEMBER. Member hanya boleh tahu PENDING/APPROVED.
 * Status internal (LANJUT/SL/TIDAK_LANJUT) tidak boleh bocor → return null.
 */
export function memberStatusLabel(status?: string | null): string | null {
  if (status === "PENDING") return "Menunggu"
  if (status === "APPROVED") return "Sedang Taaruf"
  return null
}

/**
 * Ubah URL foto Supabase (bucket privat) menjadi URL proxy ber-autentikasi.
 * Bucket pnkb sekarang private → akses hanya lewat /api/photo (cek login).
 * Mengembalikan null bila tidak ada foto.
 */
export function photoUrl(fotoProfil?: string | null): string | null {
  if (!fotoProfil) return null

  // Sudah berupa URL proxy
  if (fotoProfil.startsWith("/api/photo")) return fotoProfil

  // Ekstrak path setelah ".../pnkb/" dari URL Supabase lama
  const match = fotoProfil.match(/\/pnkb\/(.+)$/)
  const path = match ? match[1] : fotoProfil
  const cleanPath = path.split("?")[0]
  const version = fotoProfil.includes("?v=") ? fotoProfil.split("?v=")[1] : ""

  // HEIC/HEIF → JPEG agar bisa dirender browser
  const webPath = cleanPath.replace(/\.(heic|heif)$/i, ".jpg")

  return `/api/photo?path=${encodeURIComponent(webPath)}${version ? `&v=${version}` : ""}`
}