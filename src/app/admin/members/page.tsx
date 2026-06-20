import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { type ActionResult } from "@/lib/action-result";
import { RegisterMemberForm } from "./register-form";
import { GenderFilter } from "./gender-filter";
import { DaerahFilter } from "./daerah-filter";
import { MemberListView } from "./member-list-view";

interface MembersPageProps {
  searchParams: { q?: string; jenisKelamin?: string; asalDaerah?: string };
}

export default async function AdminMembersPage({ searchParams }: MembersPageProps) {
  const supabase = createClient();
  const q = searchParams.q || "";
  const jenisKelamin = searchParams.jenisKelamin || "";
  const asalDaerah = searchParams.asalDaerah || "";

  let query = supabase.from("Profile")
    .select("id, userId, namaLengkap, jenisKelamin, tanggalLahir, asalDaerah, asalKelompok, asalDesa, nomorHp, instagram, fotoProfil, fotoEvent, statusMubaligh, pendidikanTerakhir, statusPernikahan, pekerjaan, anakKe, jumlahSaudara, dapukanKelompok, dapukanDesa, dapukanDaerah, kondisiIbu, kondisiAyah, statusJamaahIbu, statusJamaahAyah, daerahSambung, desaSambung, kelompokSambung")
    .order("namaLengkap", { ascending: true });
  if (q) {
    query = query.or(
      `namaLengkap.ilike.%${q}%,daerahSambung.ilike.%${q}%,desaSambung.ilike.%${q}%,kelompokSambung.ilike.%${q}%`
    );
  }
  if (jenisKelamin) query = query.eq("jenisKelamin", jenisKelamin);
  if (asalDaerah) query = query.eq("asalDaerah", asalDaerah);

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
    return { ok: true, message: `Member "${namaLengkap}" berhasil didaftarkan.`, profileId: newProfile.id, userId: newUser.id };
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
            activeEvents={activeEvents || []}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0 pb-4">
          <CardTitle className="text-base">{profiles?.length || 0} Member</CardTitle>
          <div className="flex items-center gap-2">
            <form className="relative">
              <input type="hidden" name="jenisKelamin" value={jenisKelamin} />
              <input type="hidden" name="asalDaerah" value={asalDaerah} />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input name="q" placeholder="Cari nama..." defaultValue={q} className="pl-9 h-9 w-48" />
            </form>
            <DaerahFilter daerahList={daerahList || []} />
            <GenderFilter />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <MemberListView
            profiles={profiles || []}
            daerahList={daerahList || []}
            desaList={desaList || []}
            kelompokList={kelompokList || []}
            activeEvents={activeEvents || []}
            deleteMember={deleteMember}
          />
        </CardContent>
      </Card>
    </div>
  );
}





