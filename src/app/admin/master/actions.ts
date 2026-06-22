"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { type ActionResult } from "@/lib/action-result"

type Table = "Daerah" | "Desa" | "Kelompok"

export async function createMaster(table: Table, nama: string, parentId?: string): Promise<ActionResult> {
  if (!nama?.trim()) return { ok: false, message: "Nama tidak boleh kosong." }
  const supabase = createClient()

  const payload: any = { nama: nama.trim() }
  if (table === "Desa" && parentId) payload.daerahId = parentId
  if (table === "Kelompok" && parentId) payload.desaId = parentId

  const { error } = await supabase.from(table).insert(payload)

  if (error) {
    return { ok: false, message: error.code === "23505" ? "Nama sudah ada." : `Gagal: ${error.message}` }
  }

  revalidatePath("/admin/master")
  return { ok: true, message: `${table} "${nama}" ditambahkan.` }
}

export async function updateMaster(table: Table, id: string, nama: string): Promise<ActionResult> {
  if (!nama?.trim()) return { ok: false, message: "Nama tidak boleh kosong." }
  const supabase = createClient()
  const { error } = await supabase.from(table).update({ nama: nama.trim() }).eq("id", id)

  if (error) {
    return { ok: false, message: error.code === "23505" ? "Nama sudah ada." : `Gagal: ${error.message}` }
  }

  revalidatePath("/admin/master")
  return { ok: true, message: "Data diperbarui." }
}

export async function deleteMaster(table: Table, id: string): Promise<ActionResult> {
  const supabase = createClient()
  const { error } = await supabase.from(table).delete().eq("id", id)

  if (error) return { ok: false, message: `Gagal: ${error.message}` }

  revalidatePath("/admin/master")
  return { ok: true, message: "Data dihapus." }
}


export async function updateDaerahContact(id: string, contactWhatsapp: string): Promise<ActionResult> {
  const supabase = createClient()
  const { error } = await supabase
    .from("Daerah")
    .update({ contactWhatsapp: contactWhatsapp.trim() || null })
    .eq("id", id)

  if (error) return { ok: false, message: `Gagal: ${error.message}` }

  revalidatePath("/admin/master")
  return { ok: true, message: "Kontak WhatsApp diperbarui." }
}