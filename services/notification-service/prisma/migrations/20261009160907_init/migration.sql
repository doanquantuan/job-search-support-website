-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPLICATION', 'MESSAGE', 'JOB', 'SYSTEM');

-- CreateTable
CREATE TABLE "notifications" (
    "notificationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notificationId")
);
