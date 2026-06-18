import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { genderLabel, photoUrl } from "@/lib/utils";
import { type ActionResult } from "@/lib/action-result";
import { EditMemberDialog } from "./edit-dialog";
import { AddToEventButton } from "./add-to-event";
import { DeleteConfirmButton } from "@/components/admin-panel/delete-confirm-button";
import { RegisterMemberForm } from "./register-form";
import { GenderFilter } from "./gender-filter";

interface MembersPageProps {
  searchParams: { q?: string; jenisKelamin?: string };
}

function calculateAge(dob: string | null) {
  if (!dob) return "-";
  const diff = Date.now() - new Date(dob).getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
}

export default async function AdminMembersPage({ searchParams }: MembersPageProps) {
  const supabase = createClient();
  const q = searchParams.q || "";
  const jenisKelamin = searchParams.jenisKelamin || "";

  let query = supabase.from("Profile")
    .select("id, userId, namaLengkap, jenisKelamin, tanggalLahir, asalDaerah, asalKelompok, asalDesa, nomorHp, instagram, fotoProfil, fotoEvent, statusMubaligh, pendidikanTerakhir, statusPernikahan, pekerjaan, anakKe, jumlahSaudara, dapukanKelompok, dapukanDesa, dapukanDaerah, kondisiIbu, kondisiAyah, statusJamaahIbu, statusJamaahAyah, daerahSambung, desaSambung, kelompokSambung")
    .order("namaLengkap", { ascending: true });
  if (q) {
    query = query.or(
      `namaLengkap.ilike.%${q}%,daerahSambung.ilike.%${q}%,desaSambung.ilike.%${q}%,kelompokSambung.ilike.%${q}%`
    );
  }
  if (jenisKelamin) query = query.eq("jenisKelamin", jenisKelamin);

  const [{ data: profiles }, { data: daerahList }, { data: desaList }, { data: kelompokList }, { data: activeEvents }] =
    await Promise.all([
      query,
      supabase.from("Daerah").select("id, nama").order("nama"),
      supabase.from("Desa").select("id, nama, daerahId").order("nama"),
      supabase.from("Kelompok").select("id, nama, desaId").order("nama"),
      supabase.from("Event").select("id, title").eq("isActive", true).order("date", { ascending: false }),
    ]);

  // Server Action: daftarkan member baru (tanpa terikat event)
  async function registerMember(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
    "use server";
    const supabase = createClient();

    const namaLengkap = (formData.get("namaLengkap") as string)?.trim();
    const jenisKelamin = formData.get("jenisKelamin") as string;
    const tanggalLahir = formData.get("tanggalLahir") as string;
    const asalDaerah = (formData.get("asalDaerah") as string)?.trim();
    const asalKelompok = (formData.get("asalKelompok") as string)?.trim();
    const asalDesa = (formData.get("asalDesa") as string)?.trim();
    const nomorHp = (formData.get("nomorHp") as string)?.trim();
    const instagram = (formData.get("instagram") as string)?.trim() || "";

    if (!namaLengkap || !jenisKelamin || !tanggalLahir || !nomorHp) {
      return { ok: false, message: "Nama, gender, tanggal lahir, dan No. HP wajib diisi." };
    }

    const placeholderEmail = `member+${Date.now()}${Math.floor(Math.random() * 1000)}@offline.local`;
    const { data: newUser, error: userErr } = await supabase
      .from("User")
      .insert({ email: placeholderEmail, name: namaLengkap, role: "MEMBER" })
      .select("id")
      .single();

    if (userErr || !newUser) return { ok: false, message: `Gagal buat user: ${userErr?.message}` };

    // Field tambahan (opsional)
    const g = (k: string) => (formData.get(k) as string)?.trim() || undefined;
    const gInt = (k: string) => { const v = formData.get(k) as string; return v ? parseInt(v) : undefined; };

    const { data: newProfile, error: profileErr } = await supabase
      .from("Profile")
      .insert({
        userId: newUser.id,
        namaLengkap,
        jenisKelamin,
        tanggalLahir: new Date(tanggalLahir).toISOString(),
        asalDaerah: asalDaerah || "-",
        asalKelompok: asalKelompok || "-",
        asalDesa: asalDesa || "-",
        nomorHp,
        instagram,
        statusMubaligh: g("statusMubaligh"),
        pendidikanTerakhir: g("pendidikanTerakhir"),
        statusPernikahan: g("statusPernikahan"),
        pekerjaan: g("pekerjaan"),
        anakKe: gInt("anakKe"),
        jumlahSaudara: gInt("jumlahSaudara"),
        dapukanDaerah: g("dapukanDaerah"),
        dapukanDesa: g("dapukanDesa"),
        dapukanKelompok: g("dapukanKelompok"),
        daerahSambung: g("daerahSambung"),
        desaSambung: g("desaSambung"),
        kelompokSambung: g("kelompokSambung"),
        kondisiIbu: g("kondisiIbu"),
        statusJamaahIbu: g("statusJamaahIbu"),
        kondisiAyah: g("kondisiAyah"),
        statusJamaahAyah: g("statusJamaahAyah"),
      })
      .select("id")
      .single();

    if (profileErr) return { ok: false, message: `Gagal buat profil: ${profileErr.message}` };

    revalidatePath("/admin/members");
    return { ok: true, message: `Member "${namaLengkap}" berhasil didaftarkan.`, profileId: newProfile.id };
  }

  async function deleteMember(userId: string): Promise<ActionResult> {
    "use server";
    const supabase = createClient();

    // Hapus data terkait: TaarufRequest, EventAttendee, Profile, lalu User
    await supabase.from("TaarufRequest").delete().or(`senderId.eq.${userId},receiverId.eq.${userId}`);
    await supabase.from("EventAttendee").delete().eq("userId", userId);
    await supabase.from("Profile").delete().eq("userId", userId);
    const { error } = await supabase.from("User").delete().eq("id", userId);

    if (error) return { ok: false, message: `Gagal hapus: ${error.message}` };
    revalidatePath("/admin/members");
    return { ok: true, message: "Member berhasil dihapus." };
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Data Member</h2>
        <p className="text-muted-foreground">Daftar member yang bisa diikutkan ke banyak event.</p>
      </div>

      {/* Daftarkan member baru */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftarkan Member Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterMemberForm
            action={registerMember}
            daerahList={daerahList || []}
            desaList={desaList || []}
            kelompokList={kelompokList || []}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0 pb-4">
          <CardTitle className="text-base">{profiles?.length || 0} Member</CardTitle>
          <div className="flex items-center gap-2">
            <form className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input name="q" placeholder="Cari nama..." defaultValue={q} className="pl-9 h-9 w-48" />
            </form>
            <GenderFilter />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Member</th>
                  <th className="px-6 py-3 font-medium">Jenis Kelamin</th>
                  <th className="px-6 py-3 font-medium">Usia</th>
                  <th className="px-6 py-3 font-medium">Asal Daerah</th>
                  <th className="px-6 py-3 font-medium">Kelompok / Desa</th>
                  <th className="px-6 py-3 font-medium">Daerah Sambung</th>
                  <th className="px-6 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {profiles?.map((p) => (
                  <tr key={p.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Avatar className="h-9 w-9 cursor-pointer hover:ring-2 hover:ring-emerald-300 transition-all">
                              {photoUrl(p.fotoProfil) ? (
                                <AvatarImage src={photoUrl(p.fotoProfil)!} alt={p.namaLengkap} className="object-cover" />
                              ) : (
                                <AvatarFallback className="text-xs bg-muted cursor-pointer">
                                  {p.namaLengkap?.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          </DialogTrigger>
                          {photoUrl(p.fotoProfil) && (
                            <DialogContent className="max-w-lg p-2 bg-black border-none rounded-2xl">
                              <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden">
                                <img src={photoUrl(p.fotoProfil)!} alt={p.namaLengkap} className="w-full h-full object-contain" />
                              </div>
                              <p className="text-center text-white text-sm font-bold py-2">{p.namaLengkap}</p>
                            </DialogContent>
                          )}
                        </Dialog>
                        <span className="font-medium">{p.namaLengkap}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={p.jenisKelamin === "IKHWAN" ? "default" : "secondary"}>
                        {genderLabel(p.jenisKelamin)}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">{calculateAge(p.tanggalLahir)} Tahun</td>
                    <td className="px-6 py-3">{p.asalDaerah}</td>
                    <td className="px-6 py-3 text-muted-foreground">{p.asalKelompok} / {p.asalDesa}</td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {[p.daerahSambung, p.desaSambung, p.kelompokSambung].filter(Boolean).join(" / ") || <span className="text-xs italic">-</span>}
                    </td>
                    <td className="px-6 py-3 text-right">
                       <div className="flex items-center justify-end gap-1">
                         <AddToEventButton userId={p.userId} events={activeEvents || []} />
                         <EditMemberDialog
                           profile={p}
                           daerahList={daerahList || []}
                           desaList={desaList || []}
                           kelompokList={kelompokList || []}
                         />
                         <DeleteConfirmButton
                           title="Hapus Member?"
                           description={`Hapus "${p.namaLengkap}" beserta semua data taaruf & kehadiran event-nya. Aksi ini tidak bisa dibatalkan.`}
                           action={deleteMember.bind(null, p.userId)}
                         />
                       </div>
                    </td>
                  </tr>
                ))}
                {(!profiles || profiles.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      Belum ada member terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
