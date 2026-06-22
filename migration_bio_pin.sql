-- Add PIN field to TaarufRequest for public bio access
ALTER TABLE "TaarufRequest" ADD COLUMN IF NOT EXISTS "bioPin" TEXT;