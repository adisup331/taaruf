import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST: tambah data master baru (Daerah/Desa/Kelompok)
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { table, nama, parentId } = await request.json();

  if (!table || !nama) {
    return NextResponse.json({ ok: false, message: "Data tidak lengkap." }, { status: 400 });
  }

  const allowed = ["Daerah", "Desa", "Kelompok"];
  if (!allowed.includes(table)) {
    return NextResponse.json({ ok: false, message: "Tabel tidak valid." }, { status: 400 });
  }

  // Cek duplikat
  let checkQuery = supabase.from(table).select("id").eq("nama", nama.trim());
  if (table === "Desa" && parentId) checkQuery = checkQuery.eq("daerahId", parentId);
  if (table === "Kelompok" && parentId) checkQuery = checkQuery.eq("desaId", parentId);

  const { data: existing } = await checkQuery.maybeSingle();
  if (existing) {
    return NextResponse.json({ ok: true, id: existing.id, message: "Sudah ada." });
  }

  const payload: Record<string, any> = { nama: nama.trim() };
  if (table === "Desa" && parentId) payload.daerahId = parentId;
  if (table === "Kelompok" && parentId) payload.desaId = parentId;

  const { data: created, error } = await supabase
    .from(table)
    .insert(payload)
    .select("id, nama")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: created.id, nama: created.nama });
}

// GET: ambil data master berjenjang
export async function GET(request: Request) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");
  const parentId = searchParams.get("parentId");

  if (!table) {
    return NextResponse.json({ ok: false, message: "table required" }, { status: 400 });
  }

  let query = supabase.from(table).select("id, nama").order("nama");

  if (table === "Desa" && parentId) query = query.eq("daerahId", parentId);
  if (table === "Kelompok" && parentId) query = query.eq("desaId", parentId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false }, { status: 500 });

  return NextResponse.json({ ok: true, data: data || [] });
}
