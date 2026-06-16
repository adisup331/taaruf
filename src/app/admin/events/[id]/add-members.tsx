"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, CheckSquare, Square, Search } from "lucide-react";
import { toast } from "sonner";
import { genderLabel } from "@/lib/utils";

interface Member {
  userId: string;
  namaLengkap: string;
  jenisKelamin: string;
}

export function AddMembersForm({ eventId, availableMembers }: { eventId: string; availableMembers: Member[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = availableMembers.filter(m =>
    m.namaLengkap.toLowerCase().includes(search.toLowerCase())
  );

  const allFilteredSelected = filtered.length > 0 && filtered.every(m => selected.has(m.userId));

  function toggleOne(userId: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  function toggleAll() {
    if (allFilteredSelected) {
      // Deselect semua yang terfilter
      setSelected(prev => {
        const next = new Set(prev);
        filtered.forEach(m => next.delete(m.userId));
        return next;
      });
    } else {
      // Select semua yang terfilter
      setSelected(prev => {
        const next = new Set(prev);
        filtered.forEach(m => next.add(m.userId));
        return next;
      });
    }
  }

  async function handleSubmit() {
    if (selected.size === 0) {
      toast.error("Pilih minimal 1 member.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/add-members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: Array.from(selected) }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message || "Gagal");
      toast.success(data.message);
      setSelected(new Set());
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan member.");
    } finally {
      setLoading(false);
    }
  }

  if (availableMembers.length === 0) return null;

  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold">Tambah Member ke Acara</p>
        <Badge variant="outline" className="text-xs">{selected.size} dipilih</Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama member..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Select All */}
      <button
        type="button"
        onClick={toggleAll}
        className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors w-full py-1"
      >
        {allFilteredSelected
          ? <CheckSquare className="h-4 w-4 text-emerald-600" />
          : <Square className="h-4 w-4" />
        }
        {allFilteredSelected ? "Batal Pilih Semua" : `Pilih Semua (${filtered.length})`}
      </button>

      {/* List member checkbox */}
      <div className="max-h-60 overflow-y-auto space-y-1 rounded-md border bg-background p-2">
        {filtered.map(m => {
          const checked = selected.has(m.userId);
          return (
            <label
              key={m.userId}
              className={`flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer transition-colors text-sm ${checked ? "bg-emerald-50" : "hover:bg-muted/50"}`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleOne(m.userId)}
                className="h-4 w-4 rounded accent-emerald-600"
              />
              <span className="flex-1 font-medium truncate">{m.namaLengkap}</span>
              <Badge variant={m.jenisKelamin === "IKHWAN" ? "default" : "secondary"} className="text-[10px]">
                {genderLabel(m.jenisKelamin)}
              </Badge>
            </label>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-4">Tidak ditemukan.</p>
        )}
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={loading || selected.size === 0}
        className="w-full"
      >
        <UserPlus className="mr-2 h-4 w-4" />
        {loading ? "Menambahkan..." : `Tambahkan ${selected.size} Member`}
      </Button>
    </div>
  );
}
