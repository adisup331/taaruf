-- App Settings key-value store
CREATE TABLE IF NOT EXISTS "AppSetting" (
  "key"       TEXT NOT NULL,
  "value"     TEXT,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("key")
);