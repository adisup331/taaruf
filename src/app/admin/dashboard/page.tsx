import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, HeartHandshake, CheckCircle2, UserCheck } from "lucide-react";

// Cache 30 detik — dashboard tidak perlu real-time ketat
export const revalidate = 30;

export default async function AdminDashboard() {
  const supabase = createClient();

  const [
    { count: totalMembers },
    { count: pendingRequests },
    { count: approvedMatches },
    { count: totalLanjut },
    { count: checkedInToday }
  ] = await Promise.all([
    supabase.from('User').select('*', { count: 'exact', head: true }).eq('role', 'MEMBER'),
    supabase.from('TaarufRequest').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
    supabase.from('TaarufRequest').select('*', { count: 'exact', head: true }).eq('status', 'APPROVED'),
    supabase.from('TaarufRequest').select('*', { count: 'exact', head: true }).in('status', ['LANJUT', 'SL']),
    supabase.from('EventAttendee').select('*', { count: 'exact', head: true }).eq('isCheckedIn', true),
  ]);

  const stats = [
    { title: "Total Member", value: totalMembers, icon: Users, hint: "Member terdaftar" },
    { title: "Hadir (Checkin)", value: checkedInToday, icon: UserCheck, hint: "Peserta yang sudah checkin" },
    { title: "Pengajuan Pending", value: pendingRequests, icon: Clock, hint: "Menunggu plot meja" },
    { title: "Taaruf Berlangsung", value: approvedMatches, icon: HeartHandshake, hint: "Sedang di meja diskusi" },
    { title: "Sudah Lamaran (SL)", value: totalLanjut, icon: CheckCircle2, hint: "Proses taaruf selesai" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Ringkasan aktivitas platform Taaruf Syar'i.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value || 0}</div>
              <p className="text-xs text-muted-foreground">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Ringkasan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              Area Chart / Statistik Aktivitas
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              Log Aktivitas
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
