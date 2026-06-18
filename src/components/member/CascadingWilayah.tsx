"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Plus, Check, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Item { id: string; nama: string }

interface CascadingSelectProps {
  name: string;
  label: string;
  value: string;
  onChange: (val: string, id?: string) => void;
  options: Item[];
  placeholder?: string;
  // Untuk shortcut "Tambah baru" ke DB
  table: "Daerah" | "Desa" | "Kelompok";
  parentId?: string; // daerahId untuk Desa, desaId untuk Kelompok
}

function CascadingSelect({
  name,
  label,
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  table,
  parentId,
}: CascadingSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = search
    ? options.filter(o => o.nama.toLowerCase().includes(search.toLowerCase()))
    : options;

  const canAdd = search.trim().length > 1 && !options.some(
    o => o.nama.toLowerCase() === search.trim().toLowerCase()
  );

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function select(item: Item) {
    onChange(item.nama, item.id);
    setOpen(false);
    setSearch("");
  }

  async function addNew() {
    const trimmed = search.trim();
    if (!trimmed) return;
    setAdding(true);
    try {
      const res = await fetch("/api/master", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table, nama: trimmed, parentId }),
      });
      const data = await res.json();
      if (!data.ok && data.message !== "Sudah ada.") throw new Error(data.message);
      onChange(trimmed, data.id);
      toast.success(`"${trimmed}" berhasil ditambahkan!`);
      setOpen(false);
      setSearch("");
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name={name} value={value} />

      <button
        type="button"
        onClick={() => { setOpen(v => !v); setSearch(""); }}
        className="flex h-10 w-full items-center justify-between rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm text-left hover:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        <span className={cn("truncate", !value && "text-gray-400")}>
          {value || placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform flex-shrink-0", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari..."
              className="flex-1 text-sm outline-none bg-transparent"
            />
          </div>

          <div className="max-h-40 overflow-y-auto">
            {filtered.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => select(opt)}
                className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-emerald-50 text-left"
              >
                <span>{opt.nama}</span>
                {value === opt.nama && <Check className="h-4 w-4 text-emerald-600" />}
              </button>
            ))}
            {filtered.length === 0 && !canAdd && (
              <p className="px-3 py-3 text-center text-xs text-gray-400">Tidak ditemukan</p>
            )}
          </div>

          {canAdd && (
            <div className="border-t p-2">
              <button
                type="button"
                onClick={addNew}
                disabled={adding}
                className="flex w-full items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
              >
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Tambah &ldquo;{search.trim()}&rdquo;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Komponen utama: 3 select berjenjang ──
interface CascadingWilayahProps {
  prefix: string; // "asal" atau "dapukan"
  labelPrefix: string; // "Asal" atau "Dapukan"
  initialDaerah: string;
  initialDesa: string;
  initialKelompok: string;
  daerahList: Item[];
  desaList: Item[];
  kelompokList: Item[];
}

export function CascadingWilayah({
  prefix,
  labelPrefix,
  initialDaerah,
  initialDesa,
  initialKelompok,
  daerahList: initDaerah,
  desaList: initDesa,
  kelompokList: initKelompok,
}: CascadingWilayahProps) {
  const [daerah, setDaerah] = useState(initialDaerah);
  const [desa, setDesa] = useState(initialDesa);
  const [kelompok, setKelompok] = useState(initialKelompok);
  const [daerahId, setDaerahId] = useState<string>("");
  const [desaId, setDesaId] = useState<string>("");

  const [daerahList] = useState(initDaerah);
  const [desaFiltered, setDesaFiltered] = useState(initDesa);
  const [kelompokFiltered, setKelompokFiltered] = useState(initKelompok);

  // Resolve initial IDs
  useEffect(() => {
    const d = initDaerah.find(x => x.nama === initialDaerah);
    if (d) {
      setDaerahId(d.id);
      // Filter desa berdasarkan daerah awal
      fetch(`/api/master?table=Desa&parentId=${d.id}`)
        .then(r => r.json())
        .then(res => {
          if (res.ok) setDesaFiltered(res.data);
          const ds = (res.data as Item[]).find(x => x.nama === initialDesa);
          if (ds) {
            setDesaId(ds.id);
            fetch(`/api/master?table=Kelompok&parentId=${ds.id}`)
              .then(r => r.json())
              .then(res2 => { if (res2.ok) setKelompokFiltered(res2.data); });
          }
        });
    }
  }, []);

  const handleDaerahChange = useCallback(async (val: string, id?: string) => {
    setDaerah(val);
    setDesa("");
    setKelompok("");
    setDesaFiltered([]);
    setKelompokFiltered([]);

    if (id) {
      setDaerahId(id);
      const res = await fetch(`/api/master?table=Desa&parentId=${id}`).then(r => r.json());
      if (res.ok) setDesaFiltered(res.data);
    }
  }, []);

  const handleDesaChange = useCallback(async (val: string, id?: string) => {
    setDesa(val);
    setKelompok("");
    setKelompokFiltered([]);

    if (id) {
      setDesaId(id);
      const res = await fetch(`/api/master?table=Kelompok&parentId=${id}`).then(r => r.json());
      if (res.ok) setKelompokFiltered(res.data);
    }
  }, []);

  const handleKelompokChange = useCallback((val: string) => {
    setKelompok(val);
  }, []);

  const dKey = prefix === "asal" ? "asalDaerah" : prefix === "sambung" ? "daerahSambung" : "dapukanDaerah";
  const dsKey = prefix === "asal" ? "asalDesa" : prefix === "sambung" ? "desaSambung" : "dapukanDesa";
  const kKey = prefix === "asal" ? "asalKelompok" : prefix === "sambung" ? "kelompokSambung" : "dapukanKelompok";

  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{labelPrefix} Daerah</label>
        <CascadingSelect
          name={dKey}
          label={`${labelPrefix} Daerah`}
          value={daerah}
          onChange={handleDaerahChange}
          options={daerahList}
          table="Daerah"
          placeholder="Pilih daerah..."
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{labelPrefix} Desa</label>
        <CascadingSelect
          name={dsKey}
          label={`${labelPrefix} Desa`}
          value={desa}
          onChange={handleDesaChange}
          options={desaFiltered}
          table="Desa"
          parentId={daerahId}
          placeholder={daerah ? "Pilih desa..." : "Pilih daerah dulu"}
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{labelPrefix} Kelompok</label>
        <CascadingSelect
          name={kKey}
          label={`${labelPrefix} Kelompok`}
          value={kelompok}
          onChange={handleKelompokChange}
          options={kelompokFiltered}
          table="Kelompok"
          parentId={desaId}
          placeholder={desa ? "Pilih kelompok..." : "Pilih desa dulu"}
        />
      </div>
    </div>
  );
}
