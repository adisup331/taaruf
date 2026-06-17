import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import { LogoutButton } from "@/components/member/LogoutButton";
import { ProfileView } from "./profile-view";

export default async function MemberProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: profile },
    { data: daerahList },
    { data: desaList },
    { data: kelompokList },
  ] = await Promise.all([
    supabase
      .from("Profile")
      .select("id, userId, namaLengkap, jenisKelamin, tanggalLahir, asalDaerah, asalKelompok, asalDesa, nomorHp, instagram, fotoProfil, statusMubaligh, pendidikanTerakhir, statusPernikahan, pekerjaan, anakKe, jumlahSaudara, dapukanKelompok, dapukanDesa, dapukanDaerah, kondisiIbu, kondisiAyah, statusJamaahIbu, statusJamaahAyah")
      .eq("userId", user.id)
      .maybeSingle(),
    supabase.from("Daerah").select("id, nama").order("nama"),
    supabase.from("Desa").select("id, nama, daerahId").order("nama"),
    supabase.from("Kelompok").select("id, nama, desaId").order("nama"),
  ]);

  if (!profile) redirect("/register-profile");

  return (
    <div className="p-4 max-w-md mx-auto pb-24 space-y-6">
      <div className="flex items-center justify-between pt-4 px-2">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <User className="h-6 w-6 text-emerald-600" /> Profil Saya
        </h1>
        <LogoutButton className="text-gray-400 hover:text-red-500" />
      </div>

      <ProfileView
        profile={profile}
        daerahList={daerahList || []}
        desaList={desaList || []}
        kelompokList={kelompokList || []}
      />

      <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-5">
        <p className="text-xs text-emerald-700 leading-relaxed font-bold">
          <span className="block mb-1 uppercase tracking-widest text-[10px]">Info</span>
          Foto Event hanya bisa diperbarui oleh Fotografer saat acara berlangsung. Kamu bisa mengganti foto profil utama dari menu Edit Profil.
        </p>
      </div>
    </div>
  );
}
