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
  contactName2: string | null;
  contactWhatsapp2: string | null;
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
  const [editName2, setEditName2] = useState("");
  const [editWa2, setEditWa2] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = search
    ? daerahList.filter(
        (d) =>
          d.nama.toLowerCase().includes(search.toLowerCase()) ||
          d.contactName?.toLowerCase().includes(search.toLowerCase()) ||
          d.contactName2?.toLowerCase().includes(search.toLowerCase()) ||
          d.contactWhatsapp?.includes(search) ||
          d.contactWhatsapp2?.includes(search)
      )
    : daerahList;

  function startEdit(d: Daerah) {
    setEditingId(d.id);
    setEditName(d.contactName || "");
    setEditWa(d.contactWhatsapp || "");
    setEditName2(d.contactName2 || "");
    setEditWa2(d.contactWhatsapp2 || "");
  }

  async function saveEdit(id: string) {
    setLoading(true);
    const fd = new FormData();
    fd.set("contactName", editName);
    fd.set("contactWhatsapp", editWa);
    fd.set("contactName2", editName2);
    fd.set("contactWhatsapp2", editWa2);
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

  const hasContact = (d: Daerah) => d.contactName || d.contactWhatsapp || d.contactName2 || d.contactWhatsapp2;

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari daerah atau nama PIC..." className="pl-9" />
      </div>

      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>{daerahList.length} daerah sambung</span>
        <span>{daerahList.filter(hasContact).length} sudah ada kontak</span>
        <span className="text-amber-600 font-medium">{daerahList.filter((d) => !hasContact(d)).length} belum ada kontak</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((d) => {
          const count = memberCounts[d.nama] || 0;
          return (
            <Card
              key={d.id}
              className={`overflow-hidden transition-all ${editingId === d.id ? "ring-2 ring-emerald-500" : hasContact(d) ? "" : "border-dashed border-amber-300"}`}
            >
              <CardContent className="p-4 space-y-3">
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
                  <div className="space-y-3">
                    <div className="space-y-2 rounded-lg border p-3 bg-muted/20">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase">PIC 1</p>
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nama PIC 1" className="h-9" autoFocus />
                      <Input value={editWa} onChange={(e) => setEditWa(e.target.value)} placeholder="No. WhatsApp 1" type="tel" className="h-9" />
                    </div>
                    <div className="space-y-2 rounded-lg border p-3 bg-muted/20">
                      <p className="text-[10px] font-bold text-blue-600 uppercase">PIC 2 (opsional)</p>
                      <Input value={editName2} onChange={(e) => setEditName2(e.target.value)} placeholder="Nama PIC 2" className="h-9" />
                      <Input value={editWa2} onChange={(e) => setEditWa2(e.target.value)} placeholder="No. WhatsApp 2" type="tel" className="h-9" />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" disabled={loading} onClick={() => saveEdit(d.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                        <Check className="h-3.5 w-3.5 mr-1" /> Simpan
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ContactRow label="PIC 1" name={d.contactName} phone={d.contactWhatsapp} />
                    {(d.contactName2 || d.contactWhatsapp2) && (
                      <ContactRow label="PIC 2" name={d.contactName2} phone={d.contactWhatsapp2} />
                    )}
                    {!d.contactName && !d.contactWhatsapp && !d.contactName2 && !d.contactWhatsapp2 && (
                      <p className="text-xs text-gray-400 italic">Belum ada kontak</p>
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

function ContactRow({ label, name, phone }: { label: string; name: string | null; phone: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
      <div className="flex items-center gap-2 text-sm">
        <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        {name ? <span className="font-medium text-gray-700">{name}</span> : <span className="text-gray-400 italic text-xs">-</span>}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Phone className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
        {phone ? (
          <a href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-medium hover:underline">{phone}</a>
        ) : (
          <span className="text-gray-400 italic text-xs">-</span>
        )}
      </div>
    </div>
  );
}