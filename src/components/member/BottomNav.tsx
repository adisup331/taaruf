"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, HeartHandshake, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav({ taarufBadge = 0 }: { taarufBadge?: number }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Mencegah hydration mismatch: hanya render setelah mounted di client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const tabs = [
    { href: "/dashboard", label: "Jelajah", icon: LayoutGrid, badge: 0 },
    { href: "/taaruf", label: "Taaruf", icon: HeartHandshake, badge: taarufBadge },
    { href: "/profil", label: "Profil", icon: User, badge: 0 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-md items-stretch">
        {tabs.map((t) => {
          const active = pathname === t.href || pathname.startsWith(t.href + "/");
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors",
                active ? "text-emerald-600" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon className="h-5 w-5" />
              {t.label}
              {t.badge > 0 && (
                <span className="absolute right-1/2 top-1.5 translate-x-4 rounded-full bg-emerald-600 px-1.5 text-[10px] font-bold text-white">
                  {t.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
