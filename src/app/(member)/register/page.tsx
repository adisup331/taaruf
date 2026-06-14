"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { registerManualMember } from "./actions";

export default function MemberRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const username = (formData.get("username") as string)?.trim().toLowerCase();
    const password = (formData.get("password") as string)?.trim();

    const res = await registerManualMember(
      { ok: false, message: "" },
      formData
    );

    if (res.ok) {
      setSuccess("Akun berhasil dibuat! Mengalihkan...");

      // Auto login setelah daftar berhasil
      const email = `${username}@member.local`;
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password: password!,
      });

      if (loginError) {
        // Jika auto login gagal, arahkan ke login manual
        setTimeout(() => {
          router.push(`/login?username=${encodeURIComponent(username)}&next=${encodeURIComponent(next)}`);
        }, 1200);
      } else {
        // Berhasil login -> langsung ke dashboard/next
        router.push(next);
        router.refresh();
      }
    } else {
      setError(res.message);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-emerald-50 p-4">
      <div className="w-full max-w-sm space-y-6 rounded-3xl bg-white p-8 text-center shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-emerald-800">Daftar Akun Member</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tidak punya Gmail? Daftar manual pakai username & password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          {error && (
            <p className="rounded bg-red-50 p-2 text-xs font-bold text-red-500">{error}</p>
          )}
          {success && (
            <p className="rounded bg-emerald-50 p-2 text-xs font-bold text-emerald-600">
              {success} Mengarahkan ke login...
            </p>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Nama Lengkap</label>
            <Input name="namaLengkap" required placeholder="Nama sesuai biodata" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Username</label>
            <Input
              name="username"
              required
              placeholder="huruf kecil, angka, underscore"
              pattern="[a-z0-9_]{3,20}"
              title="3-20 karakter: huruf kecil, angka, underscore"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Password</label>
            <Input name="password" type="password" required minLength={6} placeholder="minimal 6 karakter" />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl bg-emerald-600 font-bold hover:bg-emerald-700"
          >
            {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
          </Button>
        </form>

        <p className="text-xs text-gray-500">
          Sudah punya akun?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-bold text-emerald-700">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
