-- Event Staff: per-event pengurus credentials

-- Add EVENT_STAFF to the Role enum (required by src/app/admin/events/[id]/event-staff-actions.ts)
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'EVENT_STAFF';

CREATE TABLE IF NOT EXISTS "EventStaff" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "eventId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "label" TEXT NOT NULL DEFAULT 'Pengurus',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "EventStaff_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "EventStaff_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE,
  CONSTRAINT "EventStaff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "EventStaff_eventId_userId_key" UNIQUE ("eventId", "userId"),
  CONSTRAINT "EventStaff_username_key" UNIQUE ("username")
);

CREATE INDEX IF NOT EXISTS "EventStaff_eventId_idx" ON "EventStaff"("eventId");
