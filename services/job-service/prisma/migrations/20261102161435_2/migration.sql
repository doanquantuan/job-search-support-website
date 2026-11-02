-- CreateEnum
CREATE TYPE "JobReportReason" AS ENUM ('FRAUD', 'FAKE_INFORMATION', 'DUPLICATE', 'INAPPROPRIATE_CONTENT', 'OTHER');

-- CreateEnum
CREATE TYPE "JobReportStatus" AS ENUM ('PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED');

-- CreateTable
CREATE TABLE "saved_jobs" (
    "jobId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_jobs_pkey" PRIMARY KEY ("jobId","userId")
);

-- CreateTable
CREATE TABLE "job_view_histories" (
    "jobId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_view_histories_pkey" PRIMARY KEY ("jobId","userId")
);

-- CreateTable
CREATE TABLE "job_reports" (
    "reportId" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "reportedBy" UUID NOT NULL,
    "reason" "JobReportReason" NOT NULL,
    "description" TEXT,
    "status" "JobReportStatus" NOT NULL DEFAULT 'PENDING',
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" UUID,
    "adminNote" TEXT,

    CONSTRAINT "job_reports_pkey" PRIMARY KEY ("reportId")
);

-- CreateIndex
CREATE INDEX "saved_jobs_userId_idx" ON "saved_jobs"("userId");

-- CreateIndex
CREATE INDEX "saved_jobs_jobId_idx" ON "saved_jobs"("jobId");

-- CreateIndex
CREATE INDEX "job_view_histories_userId_idx" ON "job_view_histories"("userId");

-- CreateIndex
CREATE INDEX "job_view_histories_jobId_idx" ON "job_view_histories"("jobId");

-- CreateIndex
CREATE INDEX "job_reports_status_reportedAt_idx" ON "job_reports"("status", "reportedAt");

-- CreateIndex
CREATE UNIQUE INDEX "job_reports_jobId_reportedBy_key" ON "job_reports"("jobId", "reportedBy");

-- CreateIndex
CREATE INDEX "job_posts_userId_idx" ON "job_posts"("userId");

-- CreateIndex
CREATE INDEX "job_posts_companyId_idx" ON "job_posts"("companyId");

-- CreateIndex
CREATE INDEX "job_posts_status_publishedAt_idx" ON "job_posts"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "job_posts_province_idx" ON "job_posts"("province");

-- CreateIndex
CREATE INDEX "job_posts_employmentType_idx" ON "job_posts"("employmentType");

-- CreateIndex
CREATE INDEX "job_posts_workMode_idx" ON "job_posts"("workMode");

-- CreateIndex
CREATE INDEX "job_posts_jobLevel_idx" ON "job_posts"("jobLevel");

-- CreateIndex
CREATE INDEX "job_posts_deadline_idx" ON "job_posts"("deadline");

-- CreateIndex
CREATE INDEX "specializations_occupationId_idx" ON "specializations"("occupationId");

-- AddForeignKey
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job_posts"("jobId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_view_histories" ADD CONSTRAINT "job_view_histories_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job_posts"("jobId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_reports" ADD CONSTRAINT "job_reports_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job_posts"("jobId") ON DELETE CASCADE ON UPDATE CASCADE;
