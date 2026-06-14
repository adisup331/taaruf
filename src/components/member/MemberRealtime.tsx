"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

/**
 * Komponen tak terlihat untuk mendengarkan perubahan status TaarufRequest secara realtime.
 * Jika ada permintaan baru atau admin mengubah status/meja, member dapat notif & refresh.
 */
export function MemberRealtime({ userId, eventId }: { userId: string, eventId: string }) {
  const router = useRouter();
  const audioCtxRef = useRef<AudioContext | null>(null);

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
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 587.33; // Nada D5 lembut
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch { /* ignore */ }
  }

  useEffect(() => {
    const supabase = createClient();

    // Unlock audio
    const unlock = () => {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (AC && !audioCtxRef.current) audioCtxRef.current = new AC();
      audioCtxRef.current?.resume();
    };
    window.addEventListener("pointerdown", unlock, { once: true });

    const channel = supabase
      .channel(`member-taaruf-status-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "TaarufRequest",
          filter: `eventId=eq.${eventId}`
        },
        async (payload) => {
          const row = payload.new as any;
          // Jika saya adalah penerima (receiver)
          if (row.receiverId === userId) {
            playBeep();

            // Ambil nama pengirim
            const { data: sender } = await supabase
              .from("Profile")
              .select("namaLengkap")
              .eq("userId", row.senderId)
              .maybeSingle();

            toast.success("💝 Ada yang ingin 'Melancarkan' taaruf denganmu!", {
              description: `Dari: ${sender?.namaLengkap || "Seseorang"}`,
              duration: 6000,
            });
            router.refresh();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "TaarufRequest",
          filter: `eventId=eq.${eventId}`
        },
        (payload) => {
          const row = payload.new as any;
          if (row.senderId === userId || row.receiverId === userId) {
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("pointerdown", unlock);
    };
  }, [userId, eventId, router]);

  return null;
}
