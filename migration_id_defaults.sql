-- Beri default auto-generate UUID untuk kolom id semua tabel
-- (sebelumnya id digenerate Prisma di app; sekarang insert via Supabase butuh default)

ALTER TABLE "User"          ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Profile"       ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Event"         ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "EventAttendee" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "TaarufRequest" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
