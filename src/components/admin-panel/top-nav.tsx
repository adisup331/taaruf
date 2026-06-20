"use client"

import { Menu, PanelLeft, Search } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { UserNav } from "./user-nav"
import { useSidebar } from "./sidebar-context"

interface TopNavProps {
  email: string
  role: string
}

function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean) // e.g. ['admin','events']

  return (
    <nav className="hidden items-center gap-1.5 text-sm md:flex">
      {segments.map((seg, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/")
        const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ")
        const isLast = i === segments.length - 1
        return (
          <React.Fragment key={href}>
            {i > 0 && <span className="text-muted-foreground">/</span>}
            {isLast ? (
              <span className="font-medium">{label}</span>
            ) : (
              <Link href={href} className="text-muted-foreground hover:text-foreground">
                {label}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

export function TopNav({ email, role }: TopNavProps) {
  const { toggleCollapsed, setMobileOpen } = useSidebar()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6 topnav-wrapper">
      {/* Desktop collapse toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:inline-flex"
        onClick={toggleCollapsed}
      >
        <PanelLeft className="h-5 w-5" />
      </Button>

      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Separator orientation="vertical" className="hidden h-6 md:block" />

      <Breadcrumb />

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden lg:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="h-9 w-56 bg-muted/50 pl-9"
          />
        </div>
        <UserNav email={email} role={role} />
      </div>
    </header>
  )
}
