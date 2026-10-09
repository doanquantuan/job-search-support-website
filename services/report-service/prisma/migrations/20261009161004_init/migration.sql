-- CreateEnum
CREATE TYPE "ReasonReport" AS ENUM ('FRAUD', 'FAKE_INFORMATION', 'DUPLICATE', 'INAPPROPRIATE_CONTENT', 'OTHER');

-- CreateEnum
CREATE TYPE "StatusReport" AS ENUM ('PENDING', 'PROCESSING', 'RESOLVED', 'REJECTED');

-- CreateTable
CREATE TABLE "job_reports" (
    "jobReportId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "reason" "ReasonReport" NOT NULL,
    "description" TEXT,
    "status" "StatusReport" NOT NULL DEFAULT 'PENDING',
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_reports_pkey" PRIMARY KEY ("jobReportId")
);
