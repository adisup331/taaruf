"use client"

import { photoUrl } from "@/lib/utils"

interface PhotoViewDialogProps {
  open: boolean
  onClose: () => void
  foto: string | null | undefined
  nama: string
}

// Fullscreen foto dialog (controlled). Dipanggil dari MemberDetailDialog.
// Saat ditutup HANYA menutup dirinya sendiri (tidak menutup parent modal).
export function PhotoViewDialog({ open, onClose, foto, nama }: PhotoViewDialogProps) {
  const imageUrl = photoUrl(foto)

  if (!open || !imageUrl) return null

  function handleClose(e: React.MouseEvent) {
    e.stopPropagation()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg mx-4 rounded-2xl bg-black p-4 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden">
          <img src={imageUrl} alt={nama} className="w-full h-full object-contain" />
        </div>
        <p className="text-center text-white text-sm font-bold">{nama}</p>
        <button
          type="button"
          onClick={handleClose}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
        >
          Kembali
        </button>
      </div>
    </div>
  )
}
