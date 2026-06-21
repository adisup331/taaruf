-- Add createdAt to TaarufRequest
ALTER TABLE "TaarufRequest" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now();