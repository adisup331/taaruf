import { createClient } from "@/lib/supabase/server";
import { PhotographyClient } from "@/components/admin-panel/photography-client";

interface PhotographyPageProps {
  searchParams: { [key: string]: string | undefined };
}

export default async function OnsitePhotographyPage({ searchParams }: PhotographyPageProps) {
  const supabase = createClient();
  const queryNum = searchParams.num || "";
  const eventId = searchParams.eventId || "";

  const { data: activeEvents } = await supabase
    .from("Event")
    .select("id, title")
    .eq("isActive", true);

  let attendee: any = null;
  if (queryNum && eventId) {
    const { data } = await supabase
      .from("EventAttendee")
      .select("id, participantNumber, User ( Profile ( id, namaLengkap, fotoProfil, asalDaerah, asalKelompok, asalDesa, jenisKelamin ) )")
      .eq("eventId", eventId)
      .eq("participantNumber", queryNum)
      .maybeSingle();
    attendee = data;
  }

  return (
    <PhotographyClient
      attendee={attendee}
      activeEvents={activeEvents || []}
      currentEventId={eventId}
      queryNum={queryNum}
    />
  );
}
