-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'COMPANY';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'SECURITY';

-- AlterTable
ALTER TABLE "notifications"
  ADD COLUMN IF NOT EXISTS "targetUrl" VARCHAR(500),
  ADD COLUMN IF NOT EXISTS "metadata" JSONB,
  ADD COLUMN IF NOT EXISTS "eventId" VARCHAR(100);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notifications_userId_isRead_createdAt_idx" ON "notifications"("userId", "isRead", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "notifications_eventId_userId_key" ON "notifications"("eventId", "userId");
