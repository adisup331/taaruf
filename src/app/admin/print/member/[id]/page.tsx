import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { photoUrl } from "@/lib/utils";

export default async function PrintMemberPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("Profile")
    .select("*, User(email, name)")
    .eq("userId", params.id)
    .single();

  if (!profile) notFound();

  const age = profile.tanggalLahir
    ? Math.abs(new Date().getFullYear() - new Date(profile.tanggalLahir).getFullYear())
    : "-";

  return (
    <div className="mx-auto max-w-2xl bg-white p-8 text-black print:p-0">
      {/* Header */}
      <div className="mb-6 border-b-4 border-emerald-600 pb-4 flex items-center gap-6">
        <div className="h-24 w-24 shrink-0 rounded-full border-2 border-emerald-200 overflow-hidden bg-gray-50 shadow">
          {(photoUrl(profile.fotoProfil) || photoUrl(profile.fotoEvent)) ? (
            <img src={(photoUrl(profile.fotoProfil) || photoUrl(profile.fotoEvent))!} alt={profile.namaLengkap} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-emerald-200 text-3xl font-black">?</div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">{profile.namaLengkap}</h1>
          <p className="text-emerald-700 font-bold">{profile.jenisKelamin === "IKHWAN" ? "Laki-Laki" : "Perempuan"} &middot; {age} Tahun</p>
          <p className="text-sm text-gray-500">ID: {profile.userId?.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      {/* Biodata Utama */}
      <Section title="Biodata">
        <Row label="Nama Lengkap" value={profile.namaLengkap} />
        <Row label="Jenis Kelamin" value={profile.jenisKelamin === "IKHWAN" ? "Laki-Laki" : "Perempuan"} />
        <Row label="Tanggal Lahir" value={profile.tanggalLahir ? new Date(profile.tanggalLahir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"} />
        <Row label="Usia" value={`${age} Tahun`} />
        <Row label="Status Pernikahan" value={profile.statusPernikahan || "-"} />
        <Row label="Status Mubaligh" value={profile.statusMubaligh || "-"} last />
      </Section>

      {/* Asal */}
      <Section title="Asal / Biodata">
        <Row label="Daerah" value={profile.asalDaerah} />
        <Row label="Desa" value={profile.asalDesa} />
        <Row label="Kelompok" value={profile.asalKelompok} last />
      </Section>

      {/* Latar Belakang */}
      {(profile.pendidikanTerakhir || profile.pekerjaan || profile.anakKe || profile.jumlahSaudara) && (
        <Section title="Latar Belakang">
          {profile.pendidikanTerakhir && <Row label="Pendidikan" value={profile.pendidikanTerakhir} />}
          {profile.pekerjaan && <Row label="Pekerjaan" value={profile.pekerjaan} />}
          {profile.anakKe && <Row label="Anak Ke" value={String(profile.anakKe)} />}
          {profile.jumlahSaudara && <Row label="Jumlah Saudara" value={String(profile.jumlahSaudara)} last />}
        </Section>
      )}

      {/* Daerah Sambung */}
      {(profile.daerahSambung || profile.desaSambung || profile.kelompokSambung) && (
        <Section title="Daerah Sambung">
          {profile.daerahSambung && <Row label="Daerah" value={profile.daerahSambung} />}
          {profile.desaSambung && <Row label="Desa" value={profile.desaSambung} />}
          {profile.kelompokSambung && <Row label="Kelompok" value={profile.kelompokSambung} last />}
        </Section>
      )}

      {/* Dapukan */}
      {(profile.dapukanDaerah || profile.dapukanDesa || profile.dapukanKelompok) && (
        <Section title="Dapukan Saat Ini">
          {profile.dapukanDaerah && <Row label="Daerah" value={profile.dapukanDaerah} />}
          {profile.dapukanDesa && <Row label="Desa" value={profile.dapukanDesa} />}
          {profile.dapukanKelompok && <Row label="Kelompok" value={profile.dapukanKelompok} last />}
        </Section>
      )}

      {/* Orang Tua */}
      {(profile.kondisiIbu || profile.kondisiAyah) && (
        <Section title="Kondisi Orang Tua">
          <Row label="Ibu" value={`${profile.kondisiIbu || "-"}${profile.statusJamaahIbu ? ` (${profile.statusJamaahIbu})` : ""}`} />
          <Row label="Bapak" value={`${profile.kondisiAyah || "-"}${profile.statusJamaahAyah ? ` (${profile.statusJamaahAyah})` : ""}`} last />
        </Section>
      )}

      {/* Kontak */}
      <Section title="Kontak" last>
        {profile.nomorHp && <Row label="No. HP" value={profile.nomorHp} />}
        {profile.instagram && <Row label="Instagram" value={`@${profile.instagram}`} last />}
      </Section>

      {/* Footer */}
      <div className="mt-8 border-t pt-4 text-[10px] text-gray-400 font-mono flex items-center justify-between">
        <span>Dicetak: {new Date().toLocaleString("id-ID")}</span>
        <span>TaarufYuk</span>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        window.onload = () => { setTimeout(() => window.print(), 500); };
      ` }} />
    </div>
  );
}

function Section({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`mt-5 ${last ? "" : "border-b border-gray-100 pb-1"}`}>
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-2">{title}</h2>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${last ? "" : "border-b border-gray-50 pb-1"}`}>
      <span className="text-gray-500">{label}</span>
      <span className="font-bold text-right">{value || "-"}</span>
    </div>
  );
}
