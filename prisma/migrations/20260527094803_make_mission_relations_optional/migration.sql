-- DropForeignKey
ALTER TABLE "mission" DROP CONSTRAINT "mission_agencyId_fkey";

-- DropForeignKey
ALTER TABLE "mission" DROP CONSTRAINT "mission_launchSiteId_fkey";

-- DropForeignKey
ALTER TABLE "mission" DROP CONSTRAINT "mission_rocketId_fkey";

-- AlterTable
ALTER TABLE "mission" ALTER COLUMN "agencyId" DROP NOT NULL,
ALTER COLUMN "rocketId" DROP NOT NULL,
ALTER COLUMN "launchSiteId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "mission" ADD CONSTRAINT "mission_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission" ADD CONSTRAINT "mission_launchSiteId_fkey" FOREIGN KEY ("launchSiteId") REFERENCES "launch_site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission" ADD CONSTRAINT "mission_rocketId_fkey" FOREIGN KEY ("rocketId") REFERENCES "rocket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
