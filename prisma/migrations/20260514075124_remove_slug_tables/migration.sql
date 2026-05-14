/*
  Warnings:

  - You are about to drop the column `slug` on the `agency` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `launch_site` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `mission` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `rocket` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "agency_slug_key";

-- DropIndex
DROP INDEX "launch_site_slug_key";

-- DropIndex
DROP INDEX "mission_slug_key";

-- DropIndex
DROP INDEX "rocket_slug_key";

-- AlterTable
ALTER TABLE "agency" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "launch_site" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "mission" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "rocket" DROP COLUMN "slug";
