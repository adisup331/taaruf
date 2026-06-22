import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { PerantaraAttendeeList } from "./attendee-list";

export const revalidate = 10;

export default async function PerantaraEventPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: event } = await supabase
    .from("Event")
    .select("id, title, date, location, isActive")
    .eq("id", params.id)
    .single();

  if (!event) notFound();

  const { data: attendeesRaw } = await supabase
    .from("EventAttendee")
    .select(`
      id, participantNumber, isCheckedIn, userId,
      User ( id, email, name, Profile ( * ) )
    `)
    .eq("eventId", params.id);

  const attendees = (attendeesRaw || []).map((a: any) => {
    const userData = Array.isArray(a.User) ? a.User[0] : a.User;
    const profile = Array.isArray(userData?.Profile) ? userData.Profile[0] : userData?.Profile;
    return {
      id: a.id,
      participantNumber: a.participantNumber,
      isCheckedIn: a.isCheckedIn,
      userId: a.userId,
      profile: profile || null,
    };
  });

  attendees.sort((a: any, b: any) => {
    const numA = parseInt(a.participantNumber, 10);
    const numB = parseInt(b.participantNumber, 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    if (!isNaN(numA)) return -1;
    if (!isNaN(numB)) return 1;
    return 0;
  });

  const ikhwanCount = attendees.filter((a) => a.profile?.jenisKelamin === "IKHWAN").length;
  const akhwatCount = attendees.filter((a) => a.profile?.jenisKelamin === "AKHWAT").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/perantara"><ArrowLeft className="mr-2 h-4 w-4" /> Kembali</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{event.title}</CardTitle>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(event.date).toLocaleDateString("id-ID", { dateStyle: "full" })}</span>
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {event.location}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="font-bold">{attendees.length} Peserta</Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-bold border-blue-200 text-blue-700 bg-blue-50">{ikhwanCount} Laki-Laki</Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-bold border-pink-200 text-pink-700 bg-pink-50">{akhwatCount} Perempuan</Badge>
          </div>
        </CardHeader>
      </Card>

      <PerantaraAttendeeList attendees={attendees} />
    </div>
  );
}