import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-panel/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // ⚡ Baca role dari metadata — tidak perlu query DB
  let role = user.user_metadata?.role as string | undefined;
  let email = user.email || "";

  // Fallback ke DB hanya jika metadata kosong (Google login pertama kali)
  if (!role) {
    const { data: dbUser } = await supabase
      .from("User")
      .select("role, email")
      .eq("email", email)
      .single();

    if (!dbUser) redirect("/login");
    role = dbUser.role;

    // Simpan ke metadata agar navigasi berikutnya tidak perlu query DB
    await supabase.auth.updateUser({ data: { role } });
  }

  if (role === "MEMBER") redirect("/dashboard");
  if (!role) redirect("/login");

  return (
    <AdminShell email={email} role={role}>
      {children}
    </AdminShell>
  );
}
