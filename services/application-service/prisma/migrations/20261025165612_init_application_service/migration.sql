-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'VIEWED', 'REVIEWING', 'INTERVIEW', 'REJECTED', 'HIRED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "CVType" AS ENUM ('UPLOADED', 'BUILT');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "fullName" TEXT,
    "avatar" TEXT,
    "phone" TEXT,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_seekers" (
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_seekers_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "job_posts" (
    "jobId" UUID NOT NULL,
    "companyId" UUID,
    "recruiterId" UUID,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_posts_pkey" PRIMARY KEY ("jobId")
);

-- CreateTable
CREATE TABLE "cv_templates" (
    "templateId" UUID NOT NULL,
    "templateName" TEXT NOT NULL,
    "layout" JSONB NOT NULL,
    "previewUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cv_templates_pkey" PRIMARY KEY ("templateId")
);

-- CreateTable
CREATE TABLE "cvs" (
    "cvId" UUID NOT NULL,
    "jobSeekerId" UUID NOT NULL,
    "templateId" UUID,
    "title" TEXT NOT NULL,
    "type" "CVType" NOT NULL DEFAULT 'UPLOADED',
    "content" JSONB,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cvs_pkey" PRIMARY KEY ("cvId")
);

-- CreateTable
CREATE TABLE "applications" (
    "applicationId" UUID NOT NULL,
    "jobSeekerId" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "cvId" UUID,
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
    "changedBy" UUID,
    "note" TEXT,

    CONSTRAINT "application_status_histories_pkey" PRIMARY KEY ("historyId")
);

-- CreateIndex
CREATE INDEX "applications_jobSeekerId_idx" ON "applications"("jobSeekerId");

-- CreateIndex
CREATE INDEX "applications_jobId_idx" ON "applications"("jobId");

-- CreateIndex
CREATE INDEX "applications_applicationStatus_idx" ON "applications"("applicationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "applications_jobSeekerId_jobId_key" ON "applications"("jobSeekerId", "jobId");

-- CreateIndex
CREATE INDEX "application_status_histories_applicationId_idx" ON "application_status_histories"("applicationId");

-- CreateIndex
CREATE INDEX "application_status_histories_changedAt_idx" ON "application_status_histories"("changedAt");

-- AddForeignKey
ALTER TABLE "job_seekers" ADD CONSTRAINT "job_seekers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cvs" ADD CONSTRAINT "cvs_jobSeekerId_fkey" FOREIGN KEY ("jobSeekerId") REFERENCES "job_seekers"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cvs" ADD CONSTRAINT "cvs_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "cv_templates"("templateId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_jobSeekerId_fkey" FOREIGN KEY ("jobSeekerId") REFERENCES "job_seekers"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job_posts"("jobId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "cvs"("cvId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_status_histories" ADD CONSTRAINT "application_status_histories_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("applicationId") ON DELETE CASCADE ON UPDATE CASCADE;
