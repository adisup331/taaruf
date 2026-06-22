"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, User, Pencil, Check, X, Search, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { type ActionResult } from "@/lib/action-result";

interface Daerah {
  id: string;
  nama: string;
  contactName: string | null;
  contactWhatsapp: string | null;
}

interface Props {
  daerahList: Daerah[];
  memberCounts: Record<string, number>;
  updateContact: (id: string, prev: ActionResult, fd: FormData) => Promise<ActionResult>;
}

export function ContactList({ daerahList, memberCounts, updateContact }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editWa, setEditWa] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = search
    ? daerahList.filter(
        (d) =>
          d.nama.toLowerCase().includes(search.toLowerCase()) ||
          d.contactName?.toLowerCase().includes(search.toLowerCase()) ||
          d.contactWhatsapp?.includes(search)
      )
    : daerahList;

  function startEdit(d: Daerah) {
    setEditingId(d.id);
    setEditName(d.contactName || "");
    setEditWa(d.contactWhatsapp || "");
  }

  async function saveEdit(id: string) {
    setLoading(true);
    const fd = new FormData();
    fd.set("contactName", editName);
    fd.set("contactWhatsapp", editWa);
    const res = await updateContact(id, { ok: false, message: "" }, fd);
    if (res.ok) {
      toast.success(res.message);
      setEditingId(null);
      router.refresh();
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  }

  const hasContact = (d: Daerah) => d.contactName || d.contactWhatsapp;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari daerah atau nama PIC..."
          className="pl-9"
        />
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>{daerahList.length} daerah sambung</span>
        <span>{daerahList.filter(hasContact).length} sudah ada kontak</span>
        <span className="text-amber-600 font-medium">{daerahList.filter((d) => !hasContact(d)).length} belum ada kontak</span>
      </div>

      {/* List */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((d) => {
          const count = memberCounts[d.nama] || 0;
          return (
            <Card
              key={d.id}
              className={`overflow-hidden transition-all ${
                editingId === d.id ? "ring-2 ring-emerald-500" : hasContact(d) ? "" : "border-dashed border-amber-300"
              }`}
            >
              <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                    <h3 className="font-bold text-gray-900 truncate">{d.nama}</h3>
                    {count > 0 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-bold shrink-0">
                        <Users className="h-3 w-3 mr-1" />{count}
                      </Badge>
                    )}
                  </div>
                  {editingId !== d.id && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => startEdit(d)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                {editingId === d.id ? (
                  /* Edit mode */
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Nama PIC</label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Nama penanggung jawab"
                        className="h-9"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">No. WhatsApp</label>
                      <Input
                        value={editWa}
                        onChange={(e) => setEditWa(e.target.value)}
                        placeholder="081234567890"
                        type="tel"
                        className="h-9"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={loading}
                        onClick={() => saveEdit(d.id)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Check className="h-3.5 w-3.5 mr-1" /> Simpan
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="space-y-1.5">
                    {d.contactName ? (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-medium text-gray-700">{d.contactName}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-3.5 w-3.5 text-gray-300" />
                        <span className="text-gray-400 italic text-xs">Belum ada PIC</span>
                      </div>
                    )}
                    {d.contactWhatsapp ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3.5 w-3.5 text-emerald-500" />
                        <a
                          href={`https://wa.me/${d.contactWhatsapp.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 font-medium hover:underline"
                        >
                          {d.contactWhatsapp}
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3.5 w-3.5 text-gray-300" />
                        <span className="text-gray-400 italic text-xs">Belum ada nomor</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {search ? `Tidak ditemukan "${search}"` : "Belum ada data daerah. Tambahkan di Manajemen Wilayah."}
          </div>
        )}
      </div>
    </div>
  );
}