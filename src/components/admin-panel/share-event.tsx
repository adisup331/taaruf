"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Copy, Check, Download, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const PROD_URL = "https://taarufyuk.vercel.app"

export function ShareEvent({ url, slug, eventId }: { url: string; slug: string; eventId: string }) {
  const [copied, setCopied] = useState(false)
  const liveUrl = `${PROD_URL}/e/${slug}`

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const downloadQR = () => {
    const svg = document.getElementById(`qr-${slug}`)
    if (!svg) return
    const data = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const img = new window.Image()
    const size = 512
    canvas.width = size
    canvas.height = size
    img.onload = () => {
      const ctx = canvas.getContext("2d")!
      ctx.fillStyle = "#fff"
      ctx.fillRect(0, 0, size, size)
      ctx.drawImage(img, 0, 0, size, size)
      const a = document.createElement("a")
      a.download = `qr-${slug}.png`
      a.href = canvas.toDataURL("image/png")
      a.click()
    }
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(data)))
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border bg-muted/30 p-6">
      <div className="rounded-lg bg-white p-3">
        <QRCodeSVG id={`qr-${slug}`} value={liveUrl} size={180} level="H" />
      </div>

      {/* Link Production */}
      <div className="w-full space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Link Live (Production)</p>
        <div className="flex w-full items-center gap-2">
          <code className="flex-1 truncate rounded bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 border border-emerald-100">
            {liveUrl}
          </code>
          <Button type="button" variant="outline" size="icon" onClick={() => copy(liveUrl)}>
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Link Lokal */}
      {url !== liveUrl && (
        <div className="w-full space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Link Lokal (Dev)</p>
          <div className="flex w-full items-center gap-2">
            <code className="flex-1 truncate rounded bg-muted px-3 py-2 text-xs text-muted-foreground">
              {url}
            </code>
            <Button type="button" variant="outline" size="icon" onClick={() => copy(url)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Button type="button" variant="outline" size="sm" asChild className="w-full">
        <Link href={`/admin/print/event/${eventId}`} target="_blank">
          <Printer className="h-4 w-4 mr-2" /> Cetak PDF QR
        </Link>
      </Button>

      <Button type="button" variant="outline" size="sm" onClick={downloadQR} className="w-full">
        <Download className="h-4 w-4 mr-2" /> Download QR Code
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        QR Code mengarah ke link production. Member scan untuk bergabung ke acara.
      </p>
    </div>
  )
}
