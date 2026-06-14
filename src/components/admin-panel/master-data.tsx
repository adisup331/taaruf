"use client"

import * as React from "react"
import { toast } from "sonner"
import { Plus, Trash2, Pencil, Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type ActionResult } from "@/lib/action-result"

interface Item {
  id: string
  nama: string
}

interface MasterDataProps {
  title: string
  description: string
  items: Item[]
  createAction: (nama: string) => Promise<ActionResult>
  updateAction: (id: string, nama: string) => Promise<ActionResult>
  deleteAction: (id: string) => Promise<ActionResult>
}

export function MasterData({
  title,
  description,
  items,
  createAction,
  updateAction,
  deleteAction,
}: MasterDataProps) {
  const [nama, setNama] = React.useState("")
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editValue, setEditValue] = React.useState("")
  const [pending, startTransition] = React.useTransition()

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tambah {title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!nama.trim()) return
              fire(createAction(nama.trim()), () => setNama(""))
            }}
            className="flex gap-2"
          >
            <Input
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder={`Nama ${title.toLowerCase()}...`}
              className="max-w-sm"
            />
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Tambah
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar {title} ({items.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-6 py-3 font-medium">Nama</th>
                <th className="px-6 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b hover:bg-muted/50">
                  <td className="px-6 py-3">
                    {editingId === item.id ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="max-w-xs"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium">{item.nama}</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex justify-end gap-1">
                      {editingId === item.id ? (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            disabled={pending}
                            onClick={() =>
                              fire(updateAction(item.id, editValue.trim()), () => setEditingId(null))
                            }
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(item.id)
                              setEditValue(item.nama)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            disabled={pending}
                            onClick={() => {
                              if (confirm(`Hapus "${item.nama}"?`)) fire(deleteAction(item.id))
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-10 text-center text-muted-foreground">
                    Belum ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
