/**
 * Helper untuk form pendaftaran multi-step.
 * Input di step lain disembunyikan (class "hidden"), sehingga validasi bawaan browser
 * diam-diam menolak submit tanpa pesan. Validasi dilakukan manual di sini.
 */

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

/** Cari field wajib yang masih kosong. `onlyStep` membatasi ke satu step. */
export function findEmptyRequired(
  form: HTMLFormElement,
  onlyStep?: number
): { step: number; label: string; el: Field } | null {
  const fields = Array.from(form.querySelectorAll<Field>("[required]"))
  for (const el of fields) {
    const stepEl = el.closest<HTMLElement>("[data-step]")
    const step = stepEl ? Number(stepEl.dataset.step) : 0
    if (onlyStep !== undefined && step !== onlyStep) continue
    if (el.value.trim()) continue

    const wrapper = el.parentElement
    const label =
      wrapper?.querySelector("label")?.textContent?.replace("*", "").trim() ||
      el.getAttribute("placeholder") ||
      el.name
    return { step, label, el }
  }
  return null
}

/**
 * Perkecil foto sebelum upload (foto HP bisa 5-10 MB, sering gagal di sinyal lemah).
 * Kalau browser tidak bisa membaca formatnya (mis. HEIC), file asli dipakai.
 */
export async function compressImage(file: File, maxSize = 1280, quality = 0.82): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality))
    if (!blob || blob.size >= file.size) return file
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" })
  } catch {
    return file
  }
}

/** Nama file aman untuk storage. */
export function photoFileName(nama: string, file: File) {
  const safeName = (nama || "user").toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 40)
  const ext = file.type === "image/jpeg" ? "jpg" : file.name.split(".").pop() || "jpg"
  return `${safeName}-${Date.now()}.${ext}`
}
