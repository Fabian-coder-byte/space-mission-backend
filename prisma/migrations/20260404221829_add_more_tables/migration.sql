-- CreateEnum
CREATE TYPE "RocketStatus" AS ENUM ('ACTIVE', 'RETIRED', 'IN_DEVELOPMENT');

-- CreateEnum
CREATE TYPE "AgencyType" AS ENUM ('GOVERNMENT', 'PRIVATE', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "MissionType" AS ENUM ('CREWED', 'CARGO', 'SATELLITE', 'SCIENTIFIC', 'EXPLORATION', 'TEST_FLIGHT', 'RESUPPLY', 'MILITARY');

-- CreateEnum
CREATE TYPE "MissionStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'DELAYED', 'SCRUBBED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "country" TEXT,
    "type" "AgencyType",
    "description" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "foundedYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rocket" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "manufacturer" TEXT,
    "description" TEXT,
    "reusable" BOOLEAN NOT NULL DEFAULT false,
    "status" "RocketStatus",
    "heightMeters" DOUBLE PRECISION,
    "diameterMeters" DOUBLE PRECISION,
    "massKg" INTEGER,
    "payloadToLeoKg" INTEGER,
    "payloadToGtoKg" INTEGER,
    "firstFlightDate" TIMESTAMP(3),
    "imageUrl" TEXT,
    "agencyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rocket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaunchSite" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "code" TEXT,
    "locationName" TEXT,
    "country" TEXT,
    "region" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "description" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaunchSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "missionType" "MissionType",
    "status" "MissionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "launchDate" TIMESTAMP(3),
    "windowStart" TIMESTAMP(3),
    "windowEnd" TIMESTAMP(3),
    "destination" TEXT,
    "orbit" TEXT,
    "isCrewed" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT,
    "detailsUrl" TEXT,
    "agencyId" TEXT NOT NULL,
    "rocketId" TEXT NOT NULL,
    "launchSiteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agency_name_key" ON "Agency"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Agency_slug_key" ON "Agency"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Rocket_name_key" ON "Rocket"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Rocket_slug_key" ON "Rocket"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "LaunchSite_name_key" ON "LaunchSite"("name");

-- CreateIndex
CREATE UNIQUE INDEX "LaunchSite_slug_key" ON "LaunchSite"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "LaunchSite_code_key" ON "LaunchSite"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Mission_slug_key" ON "Mission"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Mission_name_launchDate_key" ON "Mission"("name", "launchDate");

-- AddForeignKey
ALTER TABLE "Rocket" ADD CONSTRAINT "Rocket_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_rocketId_fkey" FOREIGN KEY ("rocketId") REFERENCES "Rocket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_launchSiteId_fkey" FOREIGN KEY ("launchSiteId") REFERENCES "LaunchSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
