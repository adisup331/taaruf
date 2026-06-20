import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, UserPlus, Shield, Camera } from "lucide-react";
import { genderLabel } from "@/lib/utils";
import { ActionForm } from "@/components/admin-panel/action-form";
import { SubmitButton } from "@/components/admin-panel/submit-button";
import { DeleteConfirmButton } from "@/components/admin-panel/delete-confirm-button";
import { createStaff, deleteStaff, updateStaffRole } from "./actions";

export default async function AdminStaffPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = createClient();
  const q = searchParams.q || "";

  let query = supabase
    .from("User")
    .select(`
      id, email, name, role,
      Profile ( id, nomorHp, jenisKelamin )
    `)
    .in("role", ["ADMIN", "PHOTOGRAPHER"])
    .order("name", { ascending: true });

  if (q) query = query.ilike("name", `%${q}%`);

  const { data: staffRaw } = await query;

  const staff = staffRaw?.map((s: any) => ({
    ...s,
    profile: Array.isArray(s.Profile) ? s.Profile[0] : s.Profile,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen Staff</h2>
          <p className="text-muted-foreground">Kelola akun Admin dan Fotografer lapangan.</p>
        </div>
        <form className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input name="q" placeholder="Cari nama staff..." defaultValue={q} className="pl-9" />
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftarkan Staff Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <ActionForm action={createStaff} resetOnSuccess className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Nama Lengkap *</label>
              <Input name="name" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Email *</label>
              <Input name="email" type="email" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Password *</label>
              <Input name="password" type="password" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">No. HP *</label>
              <Input name="nomorHp" type="tel" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Jenis Kelamin *</label>
              <select name="jenisKelamin" required className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option value="">Pilih...</option>
                <option value="IKHWAN">Laki-Laki</option>
                <option value="AKHWAT">Perempuan</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Role *</label>
              <select name="role" required className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option value="ADMIN">Admin</option>
                <option value="PHOTOGRAPHER">Fotografer</option>
              </select>
            </div>
            <div className="flex items-end sm:col-span-2">
              <SubmitButton pendingText="Mendaftarkan..." className="w-full bg-emerald-700 hover:bg-emerald-800">
                <UserPlus className="mr-2 h-4 w-4" /> Tambah Staff
              </SubmitButton>
            </div>
          </ActionForm>
          <p className="mt-4 text-[10px] text-muted-foreground italic">
            * Password minimal 6 karakter. Staff akan bisa login menggunakan Email & Password ini.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{staff.length} Personel</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {/* Mobile */}
          <div className="space-y-3 md:hidden">
            {staff.map((s) => (
              <div key={s.id} className="rounded-2xl border bg-white p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border"><AvatarFallback className="text-xs font-bold bg-emerald-100 text-emerald-700">{s.name?.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                  </div>
                  {s.role === "ADMIN" ? (
                    <Badge variant="default" className="bg-blue-600"><Shield className="mr-1 h-3 w-3" /> Admin</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200"><Camera className="mr-1 h-3 w-3" /> Foto</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{genderLabel(s.profile?.jenisKelamin)} &middot; {s.profile?.nomorHp || "-"}</span>
                  <div className="flex gap-1">
                    <ActionForm action={updateStaffRole.bind(null, s.id, s.role === "ADMIN" ? "PHOTOGRAPHER" : "ADMIN")}>
                      <SubmitButton size="sm" variant="outline" pendingText="..." className="text-xs h-8">{s.role === "ADMIN" ? "→ Foto" : "→ Admin"}</SubmitButton>
                    </ActionForm>
                    <DeleteConfirmButton title="Hapus?" description={`Hapus ${s.name}?`} action={deleteStaff.bind(null, s.id)} />
                  </div>
                </div>
              </div>
            ))}
            {staff.length === 0 && <p className="py-8 text-center text-muted-foreground text-sm">{q ? `Tidak ada "${q}".` : "Belum ada staff."}</p>}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Nama / Email</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Jenis Kelamin</th>
                  <th className="px-6 py-3 font-medium">No. HP</th>
                  <th className="px-6 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border"><AvatarFallback className="text-xs font-bold">{s.name?.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                        <div className="flex flex-col"><span className="font-bold">{s.name}</span><span className="text-xs text-muted-foreground">{s.email}</span></div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      {s.role === "ADMIN" ? (
                        <Badge variant="default" className="bg-blue-600"><Shield className="mr-1 h-3 w-3" /> Admin</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200"><Camera className="mr-1 h-3 w-3" /> Fotografer</Badge>
                      )}
                    </td>
                    <td className="px-6 py-3"><span className="text-muted-foreground">{genderLabel(s.profile?.jenisKelamin)}</span></td>
                    <td className="px-6 py-3 text-muted-foreground font-mono">{s.profile?.nomorHp || "-"}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <ActionForm action={updateStaffRole.bind(null, s.id, s.role === "ADMIN" ? "PHOTOGRAPHER" : "ADMIN")}>
                          <SubmitButton size="sm" variant="outline" pendingText="...">Ubah ke {s.role === "ADMIN" ? "Fotografer" : "Admin"}</SubmitButton>
                        </ActionForm>
                        <DeleteConfirmButton title="Hapus Staff?" description={`Akun ${s.name} akan dihapus permanen.`} action={deleteStaff.bind(null, s.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
                {staff.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">{q ? `Tidak ada "${q}".` : "Belum ada staff."}</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
