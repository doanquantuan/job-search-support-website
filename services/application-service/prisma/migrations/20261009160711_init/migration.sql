-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'VIEWED', 'REVIEWING', 'INTERVIEW', 'REJECTED', 'HIRED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "applications" (
    "applicationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "cvId" UUID NOT NULL,
    "coverLetter" TEXT,
    "applicationStatus" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("applicationId")
);

-- CreateTable
CREATE TABLE "application_status_histories" (
    "historyId" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "applicationStatus" "ApplicationStatus" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedBy" UUID NOT NULL,
    "note" TEXT,

    CONSTRAINT "application_status_histories_pkey" PRIMARY KEY ("historyId")
);

-- AddForeignKey
ALTER TABLE "application_status_histories" ADD CONSTRAINT "application_status_histories_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("applicationId") ON DELETE CASCADE ON UPDATE CASCADE;
