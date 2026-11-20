-- AlterTable
ALTER TABLE "applications" ADD COLUMN "lastRemindedAt" TIMESTAMP(3),
ADD COLUMN "reminderCount" INTEGER NOT NULL DEFAULT 0;
