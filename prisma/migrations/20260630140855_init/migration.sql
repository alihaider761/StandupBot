-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'MEMBER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETE', 'SKIPPED');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "slackTeamId" TEXT NOT NULL,
    "slackTeamName" TEXT,
    "botAccessToken" TEXT NOT NULL,
    "paddleCustomerId" TEXT,
    "paddleSubscriptionId" TEXT,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'inactive',
    "seatCount" INTEGER NOT NULL DEFAULT 0,
    "billingCycleAnchor" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "slackUserId" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "dmChannelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StandupReport" (
    "id" TEXT NOT NULL,
    "reportDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "yesterday" TEXT,
    "today" TEXT,
    "roadblocks" TEXT,
    "hasBlocker" BOOLEAN NOT NULL DEFAULT false,
    "slackChannelId" TEXT,
    "slackThreadTs" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "StandupReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slackTeamId_key" ON "Organization"("slackTeamId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_paddleCustomerId_key" ON "Organization"("paddleCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_paddleSubscriptionId_key" ON "Organization"("paddleSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_slackUserId_key" ON "User"("slackUserId");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "StandupReport_organizationId_reportDate_idx" ON "StandupReport"("organizationId", "reportDate");

-- CreateIndex
CREATE INDEX "StandupReport_userId_reportDate_idx" ON "StandupReport"("userId", "reportDate");

-- CreateIndex
CREATE UNIQUE INDEX "StandupReport_userId_reportDate_key" ON "StandupReport"("userId", "reportDate");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandupReport" ADD CONSTRAINT "StandupReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandupReport" ADD CONSTRAINT "StandupReport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
