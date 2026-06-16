"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AddToEventProps {
  userId: string;
  events: { id: string; title: string }[];
}

export function AddToEventButton({ userId, events }: AddToEventProps) {
  const router = useRouter();
  const [eventId, setEventId] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  async function handleAdd() {
    if (!eventId) {
      toast.error("Pilih event dulu.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/add-members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: [userId] }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Gagal");
      toast.success(data.message);
      setShow(false);
      setEventId("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan ke event.");
    } finally {
      setLoading(false);
    }
  }

  if (!show) {
    return (
      <Button variant="ghost" size="icon" onClick={() => setShow(true)} title="Masukkan ke Event" className="h-8 w-8 text-muted-foreground hover:text-emerald-600">
        <CalendarPlus className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <select
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
        className="h-8 rounded-md border bg-background px-2 text-xs w-32"
      >
        <option value="">Event...</option>
        {events.map(e => (
          <option key={e.id} value={e.id}>{e.title}</option>
        ))}
      </select>
      <Button size="sm" onClick={handleAdd} disabled={loading || !eventId} className="h-8 text-xs px-2">
        {loading ? "..." : "OK"}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setShow(false)} className="h-8 text-xs px-1">✕</Button>
    </div>
  );
}
