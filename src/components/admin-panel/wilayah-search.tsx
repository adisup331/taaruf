"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Plus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface WilayahSearchProps {
  name: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { nama: string }[];
  table?: string;       // untuk add-new: "Daerah" | "Desa" | "Kelompok"
  parentId?: string;    // parent untuk cascade
  placeholder?: string;
}

export function WilayahSearch({
  name,
  label,
  value,
  onChange,
  options,
  table,
  parentId,
  placeholder = "Cari...",
}: WilayahSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = search
    ? options.filter(o => o.nama.toLowerCase().includes(search.toLowerCase()))
    : options;

  const canAdd = table && search.trim().length > 1 && !options.some(
    o => o.nama.toLowerCase() === search.trim().toLowerCase()
  );

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setSearch("");
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  async function handleAdd() {
    const t = search.trim();
    if (!t) return;
    setAdding(true);
    try {
      const payload: any = { table, nama: t };
      if (parentId) payload.parentId = parentId;
      const res = await fetch("/api/master", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!d.ok && d.message !== "Sudah ada.") throw new Error(d.message);
      onChange(t);
      toast.success(`"${t}" ditambahkan!`);
      setOpen(false); setSearch("");
    } catch (err: any) {
      toast.error(err.message || "Gagal");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-1">
      <label className="text-xs font-bold uppercase text-muted-foreground">{label}</label>
      <div ref={ref} className="relative">
        <input type="hidden" name={name} value={value} />
        <div className="flex h-10 w-full items-center gap-1 rounded-md border border-input bg-background px-3 text-sm">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={search || value}
            onChange={e => { setSearch(e.target.value); if (!e.target.value) onChange(""); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none"
          />
          {value && !search && (
            <button type="button" onClick={() => { onChange(""); setSearch(""); }} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {open && (
          <div className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-md border bg-background shadow-md">
            {filtered.map(o => (
              <button
                key={o.nama}
                type="button"
                onClick={() => { onChange(o.nama); setSearch(""); setOpen(false); }}
                className="flex w-full items-center px-3 py-2 text-sm hover:bg-muted text-left border-b last:border-0"
              >
                <span className={value === o.nama ? "font-bold text-emerald-600" : ""}>{o.nama}</span>
              </button>
            ))}
            {filtered.length === 0 && !canAdd && (
              <p className="px-3 py-3 text-center text-xs text-muted-foreground">Tidak ditemukan</p>
            )}
            {canAdd && (
              <button
                type="button"
                onClick={handleAdd}
                disabled={adding}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
              >
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Tambah &ldquo;{search.trim()}&rdquo;
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
