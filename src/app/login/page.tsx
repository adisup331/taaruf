"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { UserPlus } from "lucide-react"

export const dynamic = "force-dynamic";

function LoginForm() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || ""
  const registerHref = `/register${next ? `?next=${encodeURIComponent(next)}` : ""}`

  const [identifier, setIdentifier] = useState(searchParams.get("username") || "")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleGoogleLogin = async () => {
    const redirect = next
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      : `${window.location.origin}/auth/callback`
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirect },
    })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Username (tanpa @) bisa berupa member (@member.local) atau
    // pengurus event (@event-staff.local). Coba kedua domain.
    const raw = identifier.trim()
    const candidates = raw.includes("@")
      ? [raw]
      : [
          `${raw.toLowerCase()}@member.local`,
          `${raw.toLowerCase()}@event-staff.local`,
        ]

    let data: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>["data"] | null = null
    let email = candidates[0]

    for (const candidate of candidates) {
      const res = await supabase.auth.signInWithPassword({
        email: candidate,
        password,
      })
      if (res.data?.user && !res.error) {
        data = res.data
        email = candidate
        break
      }
    }

    if (!data?.user) {
      setError("Username/Email atau Password salah.")
      setLoading(false)
      return
    }

    // Cek role untuk routing â€” ambil dari DB
    const { data: dbUser } = await supabase
      .from("User")
      .select("role")
      .eq("email", email)
      .single()

    const role = dbUser?.role || "MEMBER"

    // Simpan role ke user metadata agar middleware tidak perlu query DB setiap request
    if (role !== data.user.user_metadata?.role) {
      await supabase.auth.updateUser({ data: { role } })
    }

    if (role === "ADMIN") {
      router.push("/admin/dashboard")
    } else if (role === "PHOTOGRAPHER") {
      router.push("/admin/events/photography")
    } else if (role === "EVENT_STAFF") {
      router.push("/pengurus")
    } else {
      router.push(next || "/dashboard")
    }
    router.refresh()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-emerald-50 p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl text-center space-y-6">
        <h1 className="text-3xl font-bold text-emerald-800">Taaruf Syar'i</h1>

        {/* Pengunjung baru: tombol daftar dibuat paling menonjol & di paling atas */}
        <div className="space-y-3 rounded-2xl bg-amber-50 border-2 border-amber-300 p-4">
          <div>
            <p className="text-base font-black text-amber-900">Belum punya akun?</p>
            <p className="text-xs text-amber-800 mt-1">
              {next.startsWith("/e/")
                ? "Daftar dulu, setelah itu kamu langsung masuk ke event."
                : "Baru pertama kali? Buat akun dulu, gratis & cepat."}
            </p>
          </div>
          <Button
            asChild
            className="h-14 w-full rounded-xl bg-amber-500 text-lg font-black text-white shadow-lg shadow-amber-200 hover:bg-amber-600"
          >
            <Link href={registerHref} className="flex items-center justify-center gap-2">
              <UserPlus className="h-6 w-6" /> DAFTAR DI SINI
            </Link>
          </Button>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-700">atau</p>
          <Button
            type="button"
            onClick={handleGoogleLogin}
            className="h-12 w-full rounded-xl border-2 border-amber-300 bg-white font-bold text-gray-700 hover:bg-amber-100 flex gap-2"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Daftar dengan Google
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Sudah punya akun? Masuk</span></div>
        </div>

        <div className="space-y-4">
           <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Login Member</p>
           <Button
            onClick={handleGoogleLogin}
            className="w-full h-12 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 font-bold rounded-xl flex gap-2"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Masuk dengan Google
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Atau Username / Email</span></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-3 text-left">
           {error && <p className="text-xs text-red-500 font-bold bg-red-50 p-2 rounded">{error}</p>}
           <Input
            type="text"
            placeholder="Username atau Email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
           />
           <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
           />
           <Button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 h-11 font-bold rounded-xl"
           >
             {loading ? "Logging in..." : "Masuk"}
           </Button>
        </form>

        <p className="text-xs text-gray-500">
          Belum punya akun?{" "}
          <Link href={registerHref} className="font-bold text-amber-600 underline">
            Daftar di sini
          </Link>
          {" "}atau{" "}
          <button type="button" onClick={handleGoogleLogin} className="font-bold text-amber-600 underline">
            pakai Google
          </button>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-emerald-50 text-emerald-700">Memuat login...</div>}>
      <LoginForm />
    </Suspense>
  )
}



