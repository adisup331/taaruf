"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || ""

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

    // Username (tanpa @) diubah jadi email sintetik member.local
    const email = identifier.includes("@")
      ? identifier.trim()
      : `${identifier.trim().toLowerCase()}@member.local`

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError || !data.user) {
      setError("Username/Email atau Password salah.")
      setLoading(false)
      return
    }

    // Tentukan tujuan berdasarkan role
    const { data: dbUser } = await supabase
      .from("User")
      .select("role")
      .eq("email", email)
      .single()

    if (dbUser?.role === "ADMIN") {
      router.push("/admin/dashboard")
    } else if (dbUser?.role === "PHOTOGRAPHER") {
      router.push("/admin/events/photography")
    } else {
      router.push(next || "/dashboard")
    }
    router.refresh()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-emerald-50 p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl text-center space-y-6">
        <h1 className="text-3xl font-bold text-emerald-800">Taaruf Syar'i</h1>

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
          Belum punya akun & tidak punya Gmail?{" "}
          <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-bold text-emerald-700">
            Daftar manual
          </Link>
        </p>
      </div>
    </div>
  )
}
