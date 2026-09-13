-- Peserta yang daftar lewat form register-profile dulu tersimpan isVerified=false tanpa nomor.
-- Verifikasi semuanya + beri nomor lanjutan per event (setelah nomor tertinggi yang sudah ada).
WITH maxnum AS (
  SELECT "eventId",
         COALESCE(MAX(CASE WHEN "participantNumber" ~ '^[0-9]+$' THEN "participantNumber"::int END), 0) AS mx
  FROM "EventAttendee"
  GROUP BY "eventId"
),
pending AS (
  SELECT a.id,
         m.mx + ROW_NUMBER() OVER (PARTITION BY a."eventId" ORDER BY a.id) AS num
  FROM "EventAttendee" a
  JOIN maxnum m ON m."eventId" = a."eventId"
  WHERE a."participantNumber" IS NULL OR a."participantNumber" = ''
)
UPDATE "EventAttendee" a
SET "participantNumber" = p.num::text
FROM pending p
WHERE a.id = p.id;

UPDATE "EventAttendee" SET "isVerified" = true WHERE "isVerified" = false;
