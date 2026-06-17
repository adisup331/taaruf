"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Plus, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchableSelectProps {
  name: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}

export function SearchableSelect({
  name,
  label,
  value,
  onChange,
  options,
  placeholder = "Pilih atau ketik...",
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [localOptions, setLocalOptions] = useState<string[]>(options);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = search
    ? localOptions.filter(o => o.toLowerCase().includes(search.toLowerCase()))
    : localOptions;

  const canAdd = search.trim().length > 1 && !localOptions.some(
    o => o.toLowerCase() === search.trim().toLowerCase()
  );

  // Close on outside click
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

  function select(val: string) {
    onChange(val);
    setOpen(false);
    setSearch("");
  }

  function addNew() {
    const trimmed = search.trim();
    if (!trimmed) return;
    setLocalOptions(prev => [...prev, trimmed].sort());
    select(trimmed);
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={value} />

      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen(v => !v); setSearch(""); }}
        className="flex h-10 w-full items-center justify-between rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm text-left transition-colors hover:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        <span className={cn("truncate", !value && "text-gray-400")}>
          {value || placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-100/50 overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-gray-50 px-3 py-2">
            <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari..."
              className="flex-1 text-sm outline-none bg-transparent"
            />
          </div>

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => select(opt)}
                className="flex w-full items-center justify-between px-3 py-2.5 text-sm hover:bg-emerald-50 transition-colors text-left"
              >
                <span>{opt}</span>
                {value === opt && <Check className="h-4 w-4 text-emerald-600" />}
              </button>
            ))}

            {filtered.length === 0 && !canAdd && (
              <p className="px-3 py-4 text-center text-xs text-gray-400">Tidak ditemukan</p>
            )}
          </div>

          {/* Add new shortcut */}
          {canAdd && (
            <div className="border-t border-gray-50 p-2">
              <button
                type="button"
                onClick={addNew}
                className="flex w-full items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Tambah &ldquo;{search.trim()}&rdquo;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
