"use client"

import * as React from "react"
import { Camera, RefreshCw, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LiveCameraProps {
  onCapture: (blob: Blob) => void
  onCancel: () => void
  isUploading: boolean
}

export function LiveCamera({ onCapture, onCancel, isUploading }: LiveCameraProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = React.useState<MediaStream | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null)
  const [capturedBlob, setCapturedBlob] = React.useState<Blob | null>(null)

  const startCamera = async () => {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 },
        audio: false,
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err: any) {
      setError("Gagal mengakses kamera. Pastikan izin kamera diberikan.")
      console.error(err)
    }
  }

  React.useEffect(() => {
    startCamera()
    return () => {
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const capture = () => {
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
        }, "image/jpeg", 0.8)
      }
    }
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

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 border-2 border-dashed rounded-xl bg-red-50">
        <p className="text-red-600 font-bold text-center">{error}</p>
        <Button onClick={startCamera}>Coba Lagi</Button>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-2xl bg-black shadow-2xl border-4 border-white">
      <div className="relative aspect-[3/4] flex items-center justify-center">
        {!capturedImage ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover mirror"
          />
        ) : (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-4">
        {!capturedImage ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="bg-white/20 text-white border-white/40 backdrop-blur-md hover:bg-white/40"
            >
              Batal
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={capture}
              className="h-16 w-16 rounded-full bg-white text-black hover:bg-gray-200 p-0 shadow-xl"
            >
              <Camera className="h-8 w-8" />
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={retake}
              disabled={isUploading}
              className="bg-white/20 text-white border-white/40 backdrop-blur-md hover:bg-white/40"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Ulang
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold px-8 shadow-xl"
            >
              {isUploading ? "Mengunggah..." : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" /> Simpan Foto
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
