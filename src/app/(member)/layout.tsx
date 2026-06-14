import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/member/BottomNav";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let showNav = false;
  let taarufBadge = 0;

  if (user) {
    const { data: dbUser } = await supabase
      .from("User")
      .select("id, role")
      .eq("email", user.email)
      .maybeSingle();

    // Nav hanya untuk MEMBER (staff diarahkan keluar oleh page masing-masing)
    if (dbUser && dbUser.role !== "ADMIN" && dbUser.role !== "PHOTOGRAPHER") {
      showNav = true;
      const uid = dbUser.id;

      // Badge = jumlah pertemuan yang sudah dapat meja (APPROVED + tableNumber)
      const { data: approved } = await supabase
        .from("TaarufRequest")
        .select("id, tableNumber")
        .eq("status", "APPROVED")
        .or(`senderId.eq.${uid},receiverId.eq.${uid}`);

      taarufBadge = (approved || []).filter((r: any) => r.tableNumber).length;
    }
  }

  return (
    <>
      {children}
      {showNav && <BottomNav taarufBadge={taarufBadge} />}
    </>
  );
}
