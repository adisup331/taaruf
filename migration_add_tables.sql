-- Tambah jumlah meja/room per Event
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "totalTables" INTEGER NOT NULL DEFAULT 0;
