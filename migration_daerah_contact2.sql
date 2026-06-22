-- Add second contact fields to Daerah table
ALTER TABLE "Daerah" ADD COLUMN IF NOT EXISTS "contactName2" TEXT;
ALTER TABLE "Daerah" ADD COLUMN IF NOT EXISTS "contactWhatsapp2" TEXT;