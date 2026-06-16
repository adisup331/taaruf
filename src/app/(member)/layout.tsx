import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/member/BottomNav";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <>{children}</>;

  // ⚡ Baca role dari metadata — tidak perlu query DB
  const role = user.user_metadata?.role as string | undefined;

  // Staff tidak dapat nav member
  if (role === "ADMIN" || role === "PHOTOGRAPHER") {
    return <>{children}</>;
  }

  // Untuk member, ambil badge count — tapi tidak perlu tahu userId
  // Gunakan user.id langsung dari auth token
  const { count } = await supabase
    .from("TaarufRequest")
    .select("id", { count: "exact", head: true })
    .eq("status", "APPROVED")
    .not("tableNumber", "is", null)
    .or(`senderId.eq.${user.id},receiverId.eq.${user.id}`);

  const taarufBadge = count || 0;

  return (
    <>
      {children}
      <BottomNav taarufBadge={taarufBadge} />
    </>
  );
}
