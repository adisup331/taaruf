"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { KeyRound, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ResetPasswordButtonProps {
  userId: string
  namaLengkap: string
}

export function ResetPasswordButton({ userId, namaLengkap }: ResetPasswordButtonProps) {
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  async function handleReset() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/members/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.message)
      toast.success(`Password "${namaLengkap}" berhasil direset ke 354313`)
      setConfirmOpen(false)
    } catch (err: any) {
      toast.error(err.message || "Gagal reset password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="rounded-lg border bg-amber-50 p-3 space-y-2">
        <div className="flex items-start gap-3">
          <KeyRound className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-amber-900">Lupa Password?</p>
            <p className="text-[10px] text-amber-700">
              Reset password member ke <code className="font-mono font-bold">354313</code>
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            className="border-amber-300 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
          >
            Reset
          </Button>
        </div>
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
          onClick={() => !loading && setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-2">
              <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <KeyRound className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-black">Reset Password?</h3>
              <p className="text-sm text-gray-600">
                Password <strong>{namaLengkap}</strong> akan direset ke{" "}
                <code className="font-mono font-bold bg-amber-100 px-2 py-0.5 rounded">354313</code>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmOpen(false)}
                disabled={loading}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {loading ? "Mereset..." : "Ya, Reset"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
