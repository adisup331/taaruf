"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "active", label: "Aktif", statuses: ["PENDING", "APPROVED"] },
  { key: "lanjut", label: "Lanjut / SL", statuses: ["LANJUT", "SL"] },
  { key: "tidak", label: "Tidak Lanjut", statuses: ["TIDAK_LANJUT"] },
  { key: "all", label: "Semua", statuses: [] },
];

export function MatchTabs({ requests, renderCard }: { requests: any[]; renderCard: (req: any) => React.ReactNode }) {
  const [activeTab, setActiveTab] = useState("active");

  const currentTab = TABS.find(t => t.key === activeTab)!;
  const filtered = currentTab.statuses.length > 0
    ? requests.filter(r => currentTab.statuses.includes(r.status))
    : requests;

  // Hitung per tab
  const counts: Record<string, number> = {};
  TABS.forEach(t => {
    counts[t.key] = t.statuses.length > 0
      ? requests.filter(r => t.statuses.includes(r.status)).length
      : requests.length;
  });

  return (
    <div className="space-y-4">
      {/* Tab buttons */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-xs font-bold transition-all",
              activeTab === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            <span className={cn(
              "ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold",
              activeTab === tab.key ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20"
            )}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid gap-4">
        {filtered.map(req => renderCard(req))}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground bg-muted/20">
            <p className="font-bold">Tidak ada data di tab ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
