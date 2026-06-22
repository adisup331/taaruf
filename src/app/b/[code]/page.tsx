import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";

export default async function ShortBioRedirect({ params }: { params: { code: string } }) {
  const supabase = createClient();

  // Cari match yang bioPin-nya ada dan id-nya diakhiri code ini
  const { data: matches } = await supabase
    .from("TaarufRequest")
    .select("id")
    .not("bioPin", "is", null)
    .limit(100);

  const match = matches?.find((m: any) => m.id.slice(-6).toLowerCase() === params.code.toLowerCase());

  if (!match) notFound();

  redirect(`/bio/${match.id}`);
}