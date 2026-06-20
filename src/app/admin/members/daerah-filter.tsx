"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export function DaerahFilter({ daerahList }: { daerahList: { nama: string }[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const asalDaerah = params.get("asalDaerah") || "";
  const q = params.get("q") || "";
  const jenisKelamin = params.get("jenisKelamin") || "";
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = search
    ? daerahList.filter((d) => d.nama.toLowerCase().includes(search.toLowerCase()))
    : daerahList;

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleSelect = (val: string) => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (jenisKelamin) query.set("jenisKelamin", jenisKelamin);
    if (val) query.set("asalDaerah", val);
    router.push(`?${query.toString()}`);
    setOpen(false);
    setSearch("");
  };

  const handleClear = () => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (jenisKelamin) query.set("jenisKelamin", jenisKelamin);
    router.push(`?${query.toString()}`);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 py-1 text-sm text-left hover:border-emerald-200 focus:outline-none"
      >
        {asalDaerah ? (
          <span className="font-medium text-foreground truncate max-w-[120px]">
            {asalDaerah}
          </span>
        ) : (
          <span className="text-muted-foreground">Semua Daerah</span>
        )}
        <svg
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-56 rounded-md border bg-background shadow-lg z-50">
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari daerah..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            <button
              type="button"
              onClick={handleClear}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
              <span className={!asalDaerah ? "font-bold" : ""}>Semua Daerah</span>
            </button>
            {filtered.map((d) => (
              <button
                key={d.nama}
                type="button"
                onClick={() => handleSelect(d.nama)}
                className="flex w-full items-center px-3 py-2 text-sm hover:bg-muted text-left"
              >
                <span className={asalDaerah === d.nama ? "font-bold text-emerald-600" : ""}>
                  {d.nama}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
