"use client"

import { cn } from "@/lib/utils"
import { Sidebar } from "./sidebar"
import { TopNav } from "./top-nav"
import { SidebarProvider, useSidebar } from "./sidebar-context"
import { TaarufRealtime } from "./taaruf-realtime"

function ShellInner({
  children,
  email,
  role,
}: {
  children: React.ReactNode
  email: string
  role: string
}) {
  const { collapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-background">
      <TaarufRealtime />
      <Sidebar />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300",
          collapsed ? "md:pl-16" : "md:pl-64"
        )}
      >
        <TopNav email={email} role={role} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

export function AdminShell({
  children,
  email,
  role,
}: {
  children: React.ReactNode
  email: string
  role: string
}) {
  return (
    <SidebarProvider>
      <ShellInner email={email} role={role}>
        {children}
      </ShellInner>
    </SidebarProvider>
  )
}
