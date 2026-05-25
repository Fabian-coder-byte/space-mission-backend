/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `agency` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalId]` on the table `launch_site` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalId]` on the table `mission` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalId]` on the table `rocket` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "agency" ADD COLUMN     "externalId" TEXT;

-- AlterTable
ALTER TABLE "launch_site" ADD COLUMN     "externalId" TEXT;

-- AlterTable
ALTER TABLE "mission" ADD COLUMN     "externalId" TEXT;

-- AlterTable
ALTER TABLE "rocket" ADD COLUMN     "externalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "agency_externalId_key" ON "agency"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "launch_site_externalId_key" ON "launch_site"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "mission_externalId_key" ON "mission"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "rocket_externalId_key" ON "rocket"("externalId");
