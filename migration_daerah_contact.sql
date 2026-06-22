-- Add contact fields to Daerah table
ALTER TABLE "Daerah" ADD COLUMN IF NOT EXISTS "contactWhatsapp" TEXT;
ALTER TABLE "Daerah" ADD COLUMN IF NOT EXISTS "contactName" TEXT;