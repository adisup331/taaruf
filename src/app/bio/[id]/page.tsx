import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BioViewer } from "./bio-viewer";

export default async function PublicBioPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: match } = await supabase
    .from("TaarufRequest")
    .select(`
      id, bioPin, status, tableNumber,
      sender:User!TaarufRequest_senderId_fkey ( id, Profile ( * ) ),
      receiver:User!TaarufRequest_receiverId_fkey ( id, Profile ( * ) )
    `)
    .eq("id", params.id)
    .single();

  if (!match || !match.bioPin) notFound();

  const senderUser = Array.isArray(match.sender) ? match.sender[0] : match.sender;
  const receiverUser = Array.isArray(match.receiver) ? match.receiver[0] : match.receiver;
  const p1 = Array.isArray(senderUser?.Profile) ? senderUser.Profile[0] : senderUser?.Profile;
  const p2 = Array.isArray(receiverUser?.Profile) ? receiverUser.Profile[0] : receiverUser?.Profile;

  return (
    <BioViewer
      matchId={match.id}
      pin={match.bioPin}
      status={match.status}
      tableNumber={match.tableNumber}
      profile1={p1}
      profile2={p2}
    />
  );
}