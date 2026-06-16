"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "active", label: "Aktif", statuses: ["PENDING", "APPROVED"] },
  { key: "lanjut", label: "Lanjut / SL", statuses: ["LANJUT", "SL"] },
  { key: "tidak", label: "Tidak Lanjut", statuses: ["TIDAK_LANJUT"] },
  { key: "all", label: "Semua", statuses: [] },
];

interface MatchTabsProps {
  counts: Record<string, number>;
  children: React.ReactNode;
}

export function MatchTabs({ counts, children }: MatchTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "active";

  function setTab(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", key);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-4">
      {/* Tab buttons */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setTab(tab.key)}
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
              {counts[tab.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Cards rendered by server */}
      {children}
    </div>
  );
}
