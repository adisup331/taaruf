import { createClient } from "@/lib/supabase/server"
import { MasterDataSection } from "@/components/admin-panel/master-data-section"
import { createMaster, updateMaster, deleteMaster } from "./actions"

export default async function MasterPage() {
  const supabase = createClient()

  // Ambil semua data Master dari Supabase
  const [
    { data: daerah },
    { data: desa },
    { data: kelompok }
  ] = await Promise.all([
    supabase.from("Daerah").select("id, nama").order("nama"),
    supabase.from("Desa").select("id, nama, daerahId").order("nama"),
    supabase.from("Kelompok").select("id, nama, desaId").order("nama")
  ])

  // Format data agar sesuai dengan komponen UI
  const desaFormatted = desa?.map(d => ({
    id: d.id,
    nama: d.nama,
    parentId: d.daerahId
  })) || []

  const kelompokFormatted = kelompok?.map(k => ({
    id: k.id,
    nama: k.nama,
    parentId: k.desaId
  })) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Wilayah</h2>
        <p className="text-muted-foreground">
          Kelola data hierarki Daerah, Desa, dan Kelompok untuk pendaftaran member.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* KOLOM 1: DAERAH */}
        <MasterDataSection
          title="Daerah"
          description="Level 1: Kota / Kabupaten"
          items={daerah || []}
          createAction={async (nama) => { "use server"; return createMaster("Daerah", nama); }}
          updateAction={async (id, nama) => { "use server"; return updateMaster("Daerah", id, nama); }}
          deleteAction={async (id) => { "use server"; return deleteMaster("Daerah", id); }}
        />

        {/* KOLOM 2: DESA */}
        <MasterDataSection
          title="Desa"
          description="Level 2: Berada di bawah Daerah"
          items={desaFormatted}
          parents={daerah || []}
          parentLabel="Daerah"
          createAction={async (nama, parentId) => { "use server"; return createMaster("Desa", nama, parentId); }}
          updateAction={async (id, nama) => { "use server"; return updateMaster("Desa", id, nama); }}
          deleteAction={async (id) => { "use server"; return deleteMaster("Desa", id); }}
        />

        {/* KOLOM 3: KELOMPOK */}
        <MasterDataSection
          title="Kelompok"
          description="Level 3: Berada di bawah Desa"
          items={kelompokFormatted}
          parents={desa || []}
          parentLabel="Desa"
          createAction={async (nama, parentId) => { "use server"; return createMaster("Kelompok", nama, parentId); }}
          updateAction={async (id, nama) => { "use server"; return updateMaster("Kelompok", id, nama); }}
          deleteAction={async (id) => { "use server"; return deleteMaster("Kelompok", id); }}
        />
      </div>
    </div>
  )
}
