import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const daerahId = req.nextUrl.searchParams.get("daerahId");
  const daerahNama = req.nextUrl.searchParams.get("daerahNama");

  let query = supabase.from("Desa").select("id, nama").order("nama");

  if (daerahId) {
    query = query.eq("daerahId", daerahId);
  } else if (daerahNama) {
    // Cari daerah by nama dulu, lalu filter desa
    const { data: daerah } = await supabase
      .from("Daerah")
      .select("id")
      .eq("nama", daerahNama)
      .single();
    if (daerah) query = query.eq("daerahId", daerah.id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
