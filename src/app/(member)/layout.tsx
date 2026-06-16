import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/member/BottomNav";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let showNav = false;
  let taarufBadge = 0;

  if (user) {
    // Single query: ambil id + role + hitung badge sekaligus
    const { data: dbUser } = await supabase
      .from("User")
      .select("id, role")
      .eq("email", user.email)
      .maybeSingle();

    if (dbUser && dbUser.role !== "ADMIN" && dbUser.role !== "PHOTOGRAPHER") {
      showNav = true;

      // Badge: count saja, tidak perlu ambil semua data
      const { count } = await supabase
        .from("TaarufRequest")
        .select("id", { count: "exact", head: true })
        .eq("status", "APPROVED")
        .not("tableNumber", "is", null)
        .or(`senderId.eq.${dbUser.id},receiverId.eq.${dbUser.id}`);

      taarufBadge = count || 0;
    }
  }

  return (
    <>
      {children}
      {showNav && <BottomNav taarufBadge={taarufBadge} />}
    </>
  );
}
