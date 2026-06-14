"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function MatchSearch({ eventId }: { eventId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = React.useState(searchParams.get("q") || "")

  // Debounce search update
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (query) {
        params.set("q", query)
      } else {
        params.delete("q")
      }
      params.set("eventId", eventId)
      router.push(`?${params.toString()}`)
    }, 400)

    return () => clearTimeout(timer)
  }, [query, eventId, router, searchParams])

  return (
    <div className="relative w-48">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Cari Kode..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-10 pl-9 pr-8 text-xs bg-muted/50 border-none focus-visible:ring-emerald-500"
      />
      {query && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-10 w-8 hover:bg-transparent"
          onClick={() => setQuery("")}
        >
          <X className="h-3 w-3 text-muted-foreground" />
        </Button>
      )}
    </div>
  )
}
