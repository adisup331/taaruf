"use client"

import * as React from "react"
import { RefreshCw, CheckCircle2, SwitchCamera, X, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LiveCameraProps {
  onCapture: (blob: Blob) => void
  onCancel: () => void
  isUploading: boolean
}

const TIMER_OPTIONS = [0, 3, 5, 10] as const

export function LiveCamera({ onCapture, onCancel, isUploading }: LiveCameraProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const streamRef = React.useRef<MediaStream | null>(null)
  const timerIdRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const [error, setError] = React.useState<string | null>(null)
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null)
  const [capturedBlob, setCapturedBlob] = React.useState<Blob | null>(null)
  const [facingMode, setFacingMode] = React.useState<"environment" | "user">("environment")
  const [timerDelay, setTimerDelay] = React.useState<number>(0)
  const [countdown, setCountdown] = React.useState<number | null>(null)

  const stopStream = React.useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const startCamera = React.useCallback(async (facing: "environment" | "user") => {
    try {
      stopStream()
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })
      streamRef.current = mediaStream
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err: any) {
      setError("Gagal mengakses kamera. Pastikan izin kamera diberikan.")
      console.error(err)
    }
  }, [stopStream])

  // Start camera on mount & when facingMode changes
  React.useEffect(() => {
    startCamera(facingMode)
    return () => stopStream()
  }, [facingMode, startCamera, stopStream])

  // Re-attach stream to video element after retake (element never unmounts now,
  // but just in case srcObject got cleared)
  React.useEffect(() => {
    if (!capturedImage && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current
      }
    }
  }, [capturedImage])

  // Lock body scroll
  React.useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [])

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (timerIdRef.current) clearInterval(timerIdRef.current)
    }
  }, [])

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"))
    setCapturedImage(null)
    setCapturedBlob(null)
  }

  const doCapture = React.useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => {
          if (blob) {
            setCapturedBlob(blob)
            setCapturedImage(canvas.toDataURL("image/jpeg"))
          }
        }, "image/jpeg", 0.85)
      }
    }
  }, [])

  const handleShutter = () => {
    if (timerDelay === 0) {
      doCapture()
      return
    }

    // Start countdown
    let remaining = timerDelay
    setCountdown(remaining)

    timerIdRef.current = setInterval(() => {
      remaining -= 1
      if (remaining <= 0) {
        if (timerIdRef.current) clearInterval(timerIdRef.current)
        timerIdRef.current = null
        setCountdown(null)
        doCapture()
      } else {
        setCountdown(remaining)
      }
    }, 1000)
  }

  const cancelCountdown = () => {
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current)
      timerIdRef.current = null
    }
    setCountdown(null)
  }

  const retake = () => {
    setCapturedImage(null)
    setCapturedBlob(null)
  }

  const handleUpload = () => {
    if (capturedBlob) {
      onCapture(capturedBlob)
    }
  }

  const cycleTimer = () => {
    const idx = TIMER_OPTIONS.indexOf(timerDelay as any)
    const next = TIMER_OPTIONS[(idx + 1) % TIMER_OPTIONS.length]
    setTimerDelay(next)
  }

  const isCountingDown = countdown !== null

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black">
      {/* Camera / preview area */}
      <div className="relative flex-1 overflow-hidden">
        {error ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
            <p className="text-center font-bold text-red-400">{error}</p>
            <Button onClick={() => startCamera(facingMode)} variant="outline" className="text-white border-white/40">
              Coba Lagi
            </Button>
          </div>
        ) : (
          <>
            {/* Video always mounted, hidden when showing captured image */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover ${capturedImage ? "hidden" : ""}`}
            />
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Captured"
                className="h-full w-full object-cover"
              />
            )}
          </>
        )}

        {/* Countdown overlay */}
        {isCountingDown && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="flex flex-col items-center gap-3">
              <span className="text-8xl font-black text-white drop-shadow-lg animate-pulse">
                {countdown}
              </span>
              <button
                type="button"
                onClick={cancelCountdown}
                className="rounded-full bg-white/20 px-5 py-2 text-sm font-bold text-white backdrop-blur-sm active:bg-white/30"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Controls bar */}
      <div className="shrink-0 bg-black/90 px-4 pb-8 pt-4">
        {!capturedImage ? (
          <div className="flex items-center justify-between">
            {/* Left: Cancel + Timer */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={isCountingDown}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white active:bg-white/30 disabled:opacity-40"
              >
                <X className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={cycleTimer}
                disabled={isCountingDown}
                className={`relative flex h-12 items-center gap-1 rounded-full px-3 text-white active:bg-white/30 disabled:opacity-40 ${
                  timerDelay > 0 ? "bg-amber-500/30" : "bg-white/15"
                }`}
              >
                <Timer className="h-5 w-5" />
                <span className="text-xs font-bold">{timerDelay > 0 ? `${timerDelay}s` : "Off"}</span>
              </button>
            </div>

            {/* Center: Shutter */}
            <button
              type="button"
              onClick={handleShutter}
              disabled={isCountingDown}
              className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white/10 active:bg-white/30 transition-colors disabled:opacity-40"
            >
              <div className="h-14 w-14 rounded-full bg-white" />
            </button>

            {/* Right: Switch camera */}
            <button
              type="button"
              onClick={toggleCamera}
              disabled={isCountingDown}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white active:bg-white/30 disabled:opacity-40"
            >
              <SwitchCamera className="h-6 w-6" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={retake}
              disabled={isUploading}
              className="h-12 rounded-full border-white/40 bg-white/10 px-6 font-bold text-white hover:bg-white/20"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Ulang
            </Button>
            <Button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className="h-12 rounded-full bg-emerald-600 px-8 font-bold text-white shadow-xl hover:bg-emerald-700"
            >
              {isUploading ? "Mengunggah..." : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" /> Simpan
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
