-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('preparing', 'in_progress', 'completed', 'abandoned');

-- CreateEnum
CREATE TYPE "CycleStatus" AS ENUM ('pending', 'in_progress', 'completed', 'skipped');

-- CreateEnum
CREATE TYPE "EnergyLevel" AS ENUM ('high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "MoraleLevel" AS ENUM ('high', 'medium', 'low');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "cycleDurationMinutes" INTEGER NOT NULL,
    "breakDurationMinutes" INTEGER NOT NULL,
    "totalCycles" INTEGER NOT NULL,
    "status" "SessionStatus" NOT NULL,
    "preparationAnswers" JSONB NOT NULL,
    "debriefAnswers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cycle" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "cycleNumber" INTEGER NOT NULL,
    "scheduledStartTime" TIMESTAMP(3) NOT NULL,
    "actualStartTime" TIMESTAMP(3),
    "actualEndTime" TIMESTAMP(3),
    "status" "CycleStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CyclePlan" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "howToStart" TEXT NOT NULL,
    "hazards" TEXT,
    "energyLevel" "EnergyLevel" NOT NULL,
    "moraleLevel" "MoraleLevel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CyclePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CycleReview" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "completedTarget" BOOLEAN NOT NULL,
    "noteworthy" TEXT,
    "distractions" TEXT,
    "improvements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CycleReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CyclePlan_cycleId_key" ON "CyclePlan"("cycleId");

-- CreateIndex
CREATE UNIQUE INDEX "CycleReview_cycleId_key" ON "CycleReview"("cycleId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cycle" ADD CONSTRAINT "Cycle_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CyclePlan" ADD CONSTRAINT "CyclePlan_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "Cycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CycleReview" ADD CONSTRAINT "CycleReview_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "Cycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
