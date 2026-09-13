import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, LogOut, Eye } from "lucide-react";
import { PengurusAttendeeList } from "./attendee-list";
import { LogoutForm } from "./logout-form";

export const revalidate = 10;

export default async function PengurusPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Find assigned event
  const { data: staff } = await supabase
    .from("EventStaff")
    .select("eventId, label, Event ( id, title, date, location, isActive )")
    .eq("userId", user.id)
    .single();

  if (!staff) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Belum Ditugaskan</h1>
          <p className="text-sm text-gray-500">Anda belum ditugaskan ke event manapun.<br/>Hubungi admin untuk informasi lebih lanjut.</p>
          <LogoutForm />
        </div>
      </div>
    );
  }

  const event = Array.isArray(staff.Event) ? staff.Event[0] : staff.Event;
  if (!event) notFound();

  // Fetch attendees with full profile
  const { data: attendeesRaw } = await supabase
    .from("EventAttendee")
    .select(`
      id, participantNumber, isCheckedIn, userId,
      User ( id, name, Profile ( * ) )
    `)
    .eq("eventId", event.id);

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
  const checkedInCount = attendees.filter((a) => a.isCheckedIn).length;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-700">
          <Eye className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">{staff.label}</span>
        </div>
        <LogoutForm />
      </div>

      {/* Event Info */}
      <Card>
        <CardHeader className="pb-3">
          <h1 className="text-lg font-black text-gray-900">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(event.date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {event.location}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-[10px] font-bold">{attendees.length} Peserta</Badge>
            <Badge variant="outline" className="text-[10px] font-bold border-blue-200 text-blue-700 bg-blue-50">{ikhwanCount} Laki-Laki</Badge>
            <Badge variant="outline" className="text-[10px] font-bold border-pink-200 text-pink-700 bg-pink-50">{akhwatCount} Perempuan</Badge>
            <Badge variant="outline" className="text-[10px] font-bold border-emerald-200 text-emerald-700 bg-emerald-50">{checkedInCount} Hadir</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Attendee List (read-only) */}
      <PengurusAttendeeList attendees={attendees} />
    </div>
  );
}
