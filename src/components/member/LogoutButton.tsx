"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function LogoutButton({ className }: { className?: string }) {
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Keluar
    </Button>
  )
}
