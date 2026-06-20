import { Suspense } from "react"
import { createAdminClient } from "@/lib/supabase/admin"
import RegisterProfileForm from "./form"

export const dynamic = "force-dynamic";

export default async function RegisterProfilePage() {
  const supabase = createAdminClient()

  const { data: activeEvents } = await supabase
    .from("Event")
    .select("id, title, date, location")
    .eq("isActive", true)
    .order("date", { ascending: true })

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500">Memuat form...</div>}>
      <RegisterProfileForm activeEvents={activeEvents ?? []} />
    </Suspense>
  )
}
