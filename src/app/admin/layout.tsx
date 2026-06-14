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

  if (!user) {
    redirect("/login");
  }

  const { data: dbUser } = await supabase
    .from("User")
    .select("role, email")
    .eq("email", user.email)
    .single();

  if (!dbUser) {
    redirect("/login");
  }

  if (dbUser.role === "MEMBER") {
    redirect("/dashboard");
  }

  return (
    <AdminShell email={dbUser.email} role={dbUser.role}>
      {children}
    </AdminShell>
  );
}
