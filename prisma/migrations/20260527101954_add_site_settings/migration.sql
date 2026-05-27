-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "siteName" TEXT NOT NULL DEFAULT 'Space Mission',
    "siteDescription" TEXT,
    "logoUrl" TEXT,
    "contactEmail" TEXT NOT NULL DEFAULT 'info@spacemission.com',
    "supportEmail" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "xUrl" TEXT,
    "youtubeUrl" TEXT,
    "footerText" TEXT,
    "showUpcomingMissionsOnHome" BOOLEAN NOT NULL DEFAULT true,
    "showAgenciesOnHome" BOOLEAN NOT NULL DEFAULT true,
    "showRocketsOnHome" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "allowRegistrations" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);
