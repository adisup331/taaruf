-- SQL Script to initialize Taaruf Syar'i Database
-- This is designed to be compatible with Supabase PostgreSQL

-- 1. ENUMS
CREATE TYPE "Role" AS ENUM ('MEMBER', 'ADMIN', 'PHOTOGRAPHER');
CREATE TYPE "Gender" AS ENUM ('IKHWAN', 'AKHWAT');
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'LANJUT', 'SL', 'TIDAK_LANJUT');

-- 2. TABLES
-- User Table (Sync with Supabase Auth)
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Profile Table
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "tanggalLahir" TIMESTAMP(3) NOT NULL,
    "jenisKelamin" "Gender" NOT NULL,
    "asalDaerah" TEXT NOT NULL,
    "asalKelompok" TEXT NOT NULL,
    "asalDesa" TEXT NOT NULL,
    "fotoProfil" TEXT,
    "nomorHp" TEXT NOT NULL,
    "instagram" TEXT NOT NULL,
    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- Session Table
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "namaSesi" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- Event Table
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPhotoBlurred" BOOLEAN NOT NULL DEFAULT true,
    "sessionId" TEXT NOT NULL,
    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- EventAttendee Table
CREATE TABLE "EventAttendee" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "participantNumber" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "EventAttendee_pkey" PRIMARY KEY ("id")
);

-- TaarufRequest Table
CREATE TABLE "TaarufRequest" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "tableNumber" INTEGER,
    CONSTRAINT "TaarufRequest_pkey" PRIMARY KEY ("id")
);

-- 3. INDEXES & CONSTRAINTS
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
CREATE UNIQUE INDEX "EventAttendee_eventId_userId_key" ON "EventAttendee"("eventId", "userId");
CREATE UNIQUE INDEX "EventAttendee_eventId_participantNumber_key" ON "EventAttendee"("eventId", "participantNumber");

-- 4. FOREIGN KEYS
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EventAttendee" ADD CONSTRAINT "EventAttendee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EventAttendee" ADD CONSTRAINT "EventAttendee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TaarufRequest" ADD CONSTRAINT "TaarufRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TaarufRequest" ADD CONSTRAINT "TaarufRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TaarufRequest" ADD CONSTRAINT "TaarufRequest_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 5. INITIAL DATA (Optional)
-- Manual Admin Assignment (Ganti dengan email admin Anda)
-- INSERT INTO "User" ("id", "email", "name", "role") VALUES ('admin_id', 'admin@example.com', 'Super Admin', 'ADMIN');
