"use client"

import * as React from "react"
import { toast } from "sonner"
import { Plus, Trash2, Pencil, Check, X, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type ActionResult } from "@/lib/action-result"

interface Item {
  id: string
  nama: string
  parentId?: string
}

interface ParentItem {
  id: string
  nama: string
}

interface MasterDataSectionProps {
  title: string
  description: string
  items: Item[]
  parents?: ParentItem[]
  parentLabel?: string
  createAction: (nama: string, parentId?: string) => Promise<ActionResult>
  updateAction: (id: string, nama: string) => Promise<ActionResult>
  deleteAction: (id: string) => Promise<ActionResult>
}

export function MasterDataSection({
  title,
  description,
  items,
  parents,
  parentLabel,
  createAction,
  updateAction,
  deleteAction,
}: MasterDataSectionProps) {
  const [nama, setNama] = React.useState("")
  const [selectedParentId, setSelectedParentId] = React.useState("")
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editValue, setEditValue] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [pending, startTransition] = React.useTransition()

  const filteredItems = search
    ? items.filter(i => i.nama.toLowerCase().includes(search.toLowerCase()))
    : items

  const fire = (p: Promise<ActionResult>, after?: () => void) =>
    startTransition(async () => {
      const r = await p
      if (r?.ok) {
        toast.success(r.message)
        after?.()
      } else {
        toast.error(r?.message || "Terjadi kesalahan.")
      }
    })

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Form Tambah */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!nama.trim()) return
            if (parents && !selectedParentId) {
              toast.error(`Pilih ${parentLabel} terlebih dahulu.`)
              return
            }
            fire(createAction(nama.trim(), selectedParentId), () => {
              setNama("")
              // Jangan reset selectedParentId agar admin bisa tambah banyak item di parent yg sama
            })
          }}
          className="flex flex-col gap-2 bg-muted/30 p-3 rounded-lg border"
        >
          {parents && (
            <select
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              required
            >
              <option value="">-- Pilih {parentLabel} --</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>{p.nama}</option>
              ))}
            </select>
          )}
          <div className="flex gap-2">
            <Input
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder={`Nama ${title}...`}
              className="flex-1 h-9"
            />
            <Button type="submit" size="sm" disabled={pending || (!!parents && !selectedParentId)}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </form>

        {/* Daftar Data */}
        <div className="border rounded-md flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative px-4 py-2 border-b">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Cari ${title}...`}
              className="w-full h-8 pl-7 pr-3 text-xs rounded-md border bg-background outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="overflow-y-auto max-h-[400px] flex-1">
            <table className="w-full text-sm">
              <tbody>
                {filteredItems.map((item) => {
                  // Jika ada parents, cari nama parent-nya untuk ditampilkan
                  const parentName = parents?.find(p => p.id === item.parentId)?.nama

                  // Highlight item jika parent-nya sedang dipilih di dropdown
                  const isRelatedToSelected = selectedParentId && item.parentId === selectedParentId

                  return (
                    <tr
                      key={item.id}
                      className={`border-b group ${isRelatedToSelected ? 'bg-emerald-50/50' : 'hover:bg-muted/50'}`}
                    >
                      <td className="px-4 py-2">
                        {editingId === item.id ? (
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-8"
                            autoFocus
                          />
                        ) : (
                          <div>
                            <span className="font-medium">{item.nama}</span>
                            {parentName && (
                              <span className="ml-2 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                {parentName}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 w-[80px]">
                        <div className="flex justify-end gap-1">
                          {editingId === item.id ? (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                disabled={pending}
                                onClick={() =>
                                  fire(updateAction(item.id, editValue.trim()), () => setEditingId(null))
                                }
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  setEditingId(item.id)
                                  setEditValue(item.nama)
                                }}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                disabled={pending}
                                onClick={() => {
                                  if (confirm(`Hapus "${item.nama}" beserta data di bawahnya?`)) fire(deleteAction(item.id))
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground text-xs">
                      {search ? `Tidak ditemukan "${search}"` : `Belum ada data ${title.toLowerCase()}.`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
