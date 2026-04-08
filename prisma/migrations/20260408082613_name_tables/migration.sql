/*
  Warnings:

  - You are about to drop the `Agency` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LaunchSite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Mission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rocket` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Mission" DROP CONSTRAINT "Mission_agencyId_fkey";

-- DropForeignKey
ALTER TABLE "Mission" DROP CONSTRAINT "Mission_launchSiteId_fkey";

-- DropForeignKey
ALTER TABLE "Mission" DROP CONSTRAINT "Mission_rocketId_fkey";

-- DropForeignKey
ALTER TABLE "Rocket" DROP CONSTRAINT "Rocket_agencyId_fkey";

-- DropTable
DROP TABLE "Agency";

-- DropTable
DROP TABLE "LaunchSite";

-- DropTable
DROP TABLE "Mission";

-- DropTable
DROP TABLE "Rocket";

-- CreateTable
CREATE TABLE "agency" (
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

    CONSTRAINT "agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rocket" (
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

    CONSTRAINT "rocket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "launch_site" (
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

    CONSTRAINT "launch_site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission" (
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

    CONSTRAINT "mission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agency_name_key" ON "agency"("name");

-- CreateIndex
CREATE UNIQUE INDEX "agency_slug_key" ON "agency"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "rocket_name_key" ON "rocket"("name");

-- CreateIndex
CREATE UNIQUE INDEX "rocket_slug_key" ON "rocket"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "launch_site_name_key" ON "launch_site"("name");

-- CreateIndex
CREATE UNIQUE INDEX "launch_site_slug_key" ON "launch_site"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "launch_site_code_key" ON "launch_site"("code");

-- CreateIndex
CREATE UNIQUE INDEX "mission_slug_key" ON "mission"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "mission_name_launchDate_key" ON "mission"("name", "launchDate");

-- AddForeignKey
ALTER TABLE "rocket" ADD CONSTRAINT "rocket_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission" ADD CONSTRAINT "mission_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission" ADD CONSTRAINT "mission_launchSiteId_fkey" FOREIGN KEY ("launchSiteId") REFERENCES "launch_site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission" ADD CONSTRAINT "mission_rocketId_fkey" FOREIGN KEY ("rocketId") REFERENCES "rocket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
