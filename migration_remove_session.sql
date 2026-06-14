-- =====================================================================
-- MIGRATION: Remove "Session" concept. Use Event directly.
-- Jalankan di Supabase SQL Editor.
-- =====================================================================

-- 1. TaarufRequest: tambah eventId, buang sessionId
ALTER TABLE "TaarufRequest" ADD COLUMN IF NOT EXISTS "eventId" TEXT;

-- (opsional) hapus FK & kolom sessionId lama jika ada
ALTER TABLE "TaarufRequest" DROP CONSTRAINT IF EXISTS "TaarufRequest_sessionId_fkey";
ALTER TABLE "TaarufRequest" DROP COLUMN IF EXISTS "sessionId";

-- FK baru ke Event
ALTER TABLE "TaarufRequest"
  ADD CONSTRAINT "TaarufRequest_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE;

-- 2. Event: buang sessionId
ALTER TABLE "Event" DROP CONSTRAINT IF EXISTS "Event_sessionId_fkey";
ALTER TABLE "Event" DROP COLUMN IF EXISTS "sessionId";

-- 3. Hapus tabel Session
DROP TABLE IF EXISTS "Session";
