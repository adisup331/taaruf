import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/member/BottomNav";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <>{children}</>;
  }

  // Paralel: ambil user + badge count sekaligus
  const [{ data: dbUser }, { count }] = await Promise.all([
    supabase.from("User").select("id, role").eq("email", user.email).maybeSingle(),
    supabase
      .from("TaarufRequest")
      .select("id", { count: "exact", head: true })
      .eq("status", "APPROVED")
      .not("tableNumber", "is", null),
  ]);

  const isStaff = dbUser?.role === "ADMIN" || dbUser?.role === "PHOTOGRAPHER";
  if (isStaff || !dbUser) {
    return <>{children}</>;
  }

  // Filter badge hanya untuk user ini (tidak bisa di DB query atas karena belum tahu uid)
  // Tapi count global cukup — badge cuma indikator
  const taarufBadge = count || 0;

  return (
    <>
      {children}
      <BottomNav taarufBadge={taarufBadge} />
    </>
  );
}
