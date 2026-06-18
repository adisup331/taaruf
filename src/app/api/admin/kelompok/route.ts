import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const desaId = req.nextUrl.searchParams.get("desaId");
  const desaNama = req.nextUrl.searchParams.get("desaNama");

  let query = supabase.from("Kelompok").select("id, nama").order("nama");
  if (desaId) {
    query = query.eq("desaId", desaId);
  } else if (desaNama) {
    const { data: desa } = await supabase
      .from("Desa")
      .select("id")
      .eq("nama", desaNama)
      .single();
    if (desa) query = query.eq("desaId", desa.id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
