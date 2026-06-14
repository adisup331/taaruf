-- Master data: Daerah, Desa, Kelompok
-- Jalankan di Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS "Daerah" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "nama" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "Daerah_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Desa" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "nama" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "Desa_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Kelompok" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "nama" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "Kelompok_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Daerah_nama_key" ON "Daerah" ("nama");
CREATE UNIQUE INDEX IF NOT EXISTS "Desa_nama_key" ON "Desa" ("nama");
CREATE UNIQUE INDEX IF NOT EXISTS "Kelompok_nama_key" ON "Kelompok" ("nama");
