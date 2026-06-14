import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import { LogoutButton } from "@/components/member/LogoutButton";
import { ProfileView } from "./profile-view";

export default async function MemberProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("Profile")
    .select("*")
    .eq("userId", user.id)
    .maybeSingle();

  if (!profile) redirect("/register-profile");

  return (
    <div className="p-4 max-w-md mx-auto pb-24 space-y-6">
      <div className="flex items-center justify-between pt-4 px-2">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <User className="h-6 w-6 text-emerald-600" /> Profil Saya
        </h1>
        <LogoutButton className="text-gray-400 hover:text-red-500" />
      </div>

      <ProfileView profile={profile} />

      <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-6">
        <p className="text-xs text-amber-700 leading-relaxed font-bold">
          <span className="block mb-1 uppercase tracking-widest text-[10px]">Pemberitahuan</span>
          Foto profil kamu sengaja tidak ditampilkan di sini demi keamanan data pribadi sesuai prinsip Syar'i.
        </p>
      </div>
    </div>
  );
}
