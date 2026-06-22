import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Eye } from "lucide-react";

export const revalidate = 10;

export default async function PerantaraPage() {
  const supabase = createClient();

  const { data: events } = await supabase
    .from("Event")
    .select("id, title, slug, date, location, isActive")
    .eq("isActive", true)
    .order("date", { ascending: false });

  const counts: Record<string, { ikhwan: number; akhwat: number; total: number }> = {};
  if (events && events.length > 0) {
    const { data: attendees } = await supabase
      .from("EventAttendee")
      .select("eventId, User ( Profile ( jenisKelamin ) )");

    attendees?.forEach((a: any) => {
      const user = Array.isArray(a.User) ? a.User[0] : a.User;
      const profile = Array.isArray(user?.Profile) ? user.Profile[0] : user?.Profile;
      const gender = profile?.jenisKelamin;
      const eid = a.eventId;
      if (!counts[eid]) counts[eid] = { ikhwan: 0, akhwat: 0, total: 0 };
      counts[eid].total++;
      if (gender === "IKHWAN") counts[eid].ikhwan++;
      else if (gender === "AKHWAT") counts[eid].akhwat++;
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Daftar Event</h2>
        <p className="text-muted-foreground">Pilih event untuk melihat data peserta.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events?.map((event: any) => {
          const c = counts[event.id] || { ikhwan: 0, akhwat: 0, total: 0 };
          return (
            <Card key={event.id} className="overflow-hidden">
              <CardHeader className="border-b">
                <CardTitle className="text-lg">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    {new Date(event.date).toLocaleDateString("id-ID", { dateStyle: "full" })}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium flex-wrap">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{c.total} peserta</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-bold border-blue-200 text-blue-700 bg-blue-50">
                      {c.ikhwan} Laki-Laki
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-bold border-pink-200 text-pink-700 bg-pink-50">
                      {c.akhwat} Perempuan
                    </Badge>
                  </div>
                </div>

                <Button asChild className="w-full">
                  <Link href={`/admin/perantara/event/${event.id}`}>
                    <Eye className="mr-2 h-4 w-4" /> Lihat Peserta
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}

        {(!events || events.length === 0) && (
          <div className="col-span-full rounded-xl border border-dashed py-20 text-center text-muted-foreground">
            <Calendar className="mx-auto mb-4 h-12 w-12 opacity-20" />
            <p className="font-medium">Belum ada event aktif</p>
          </div>
        )}
      </div>
    </div>
  );
}