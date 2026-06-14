"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

/**
 * Dengarkan INSERT baru di tabel TaarufRequest secara realtime.
 * Saat ada member kirim CV → tampilkan toast + bunyi notifikasi, lalu refresh
 * agar Live Match Desk ikut ter-update.
 *
 * Prasyarat: Realtime/Replication tabel "TaarufRequest" AKTIF di Supabase
 * (Database → Replication → publication supabase_realtime → centang TaarufRequest).
 */
export function TaarufRealtime() {
  const router = useRouter();
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Bunyi "ding" pendek pakai Web Audio (tanpa file aset)
  function playBeep() {
    try {
      let ctx = audioCtxRef.current;
      if (!ctx) {
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        if (!AC) return;
        ctx = new AC();
        audioCtxRef.current = ctx;
      }
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;
      const notes = [880, 1320]; // dua nada naik
      notes.forEach((freq, i) => {
        const osc = ctx!.createOscillator();
        const gain = ctx!.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const t = now + i * 0.16;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        osc.connect(gain);
        gain.connect(ctx!.destination);
        osc.start(t);
        osc.stop(t + 0.24);
      });
    } catch {
      /* abaikan kalau audio diblokir browser */
    }
  }

  useEffect(() => {
    const supabase = createClient();

    // Unlock AudioContext pada interaksi pertama (kebijakan autoplay browser)
    const unlock = () => {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (AC && !audioCtxRef.current) audioCtxRef.current = new AC();
      audioCtxRef.current?.resume();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);

    const channel = supabase
      .channel("taaruf-requests-admin")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "TaarufRequest" },
        async (payload) => {
          const row: any = payload.new;
          playBeep();

          // Ambil nama pengirim & penerima (best-effort)
          let senderName = "Seorang peserta";
          let receiverName = "lawan jenis";
          try {
            const [{ data: s }, { data: r }] = await Promise.all([
              supabase.from("Profile").select("namaLengkap").eq("userId", row.senderId).maybeSingle(),
              supabase.from("Profile").select("namaLengkap").eq("userId", row.receiverId).maybeSingle(),
            ]);
            if (s?.namaLengkap) senderName = s.namaLengkap;
            if (r?.namaLengkap) receiverName = r.namaLengkap;
          } catch {
            /* abaikan */
          }

          toast.info("📩 Permintaan Taaruf Baru!", {
            description: `${senderName} mengajukan taaruf ke ${receiverName}.`,
            duration: 8000,
          });

          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [router]);

  return null;
}
