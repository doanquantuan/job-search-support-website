-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE');

-- CreateEnum
CREATE TYPE "JobLevel" AS ENUM ('INTERN', 'FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD', 'MANAGER');

-- CreateEnum
CREATE TYPE "SalaryType" AS ENUM ('RANGE', 'NEGOTIABLE');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('NO_REQUIREMENT', 'HIGH_SCHOOL', 'COLLEGE', 'UNIVERSITY', 'POSTGRADUATE');

-- CreateTable
CREATE TABLE "job_posts" (
    "jobId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "locationId" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "benefits" TEXT,
    "workingHours" TEXT,
    "salaryType" "SalaryType" NOT NULL DEFAULT 'NEGOTIABLE',
    "salaryMin" DECIMAL(12,2),
    "salaryMax" DECIMAL(12,2),
    "experienceMin" INTEGER,
    "experienceMax" INTEGER,
    "jobLevel" "JobLevel" NOT NULL DEFAULT 'INTERN',
    "educationLevel" "EducationLevel" NOT NULL DEFAULT 'NO_REQUIREMENT',
    "vacancies" INTEGER NOT NULL DEFAULT 1,
    "workMode" "WorkMode" NOT NULL DEFAULT 'ONSITE',
    "employmentType" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_posts_pkey" PRIMARY KEY ("jobId")
);

-- CreateTable
CREATE TABLE "specializations" (
    "specializationId" UUID NOT NULL,
    "specializationName" TEXT NOT NULL,

    CONSTRAINT "specializations_pkey" PRIMARY KEY ("specializationId")
);

-- CreateTable
CREATE TABLE "job_post_specializations" (
    "jobId" UUID NOT NULL,
    "specializationId" UUID NOT NULL,

    CONSTRAINT "job_post_specializations_pkey" PRIMARY KEY ("jobId","specializationId")
);

-- CreateTable
CREATE TABLE "job_post_skills" (
    "jobId" UUID NOT NULL,
    "skillId" UUID NOT NULL,
    "skillName" TEXT,

    CONSTRAINT "job_post_skills_pkey" PRIMARY KEY ("jobId","skillId")
);

-- CreateTable
CREATE TABLE "saved_jobs" (
    "userId" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_jobs_pkey" PRIMARY KEY ("userId","jobId")
);

-- CreateTable
CREATE TABLE "job_view_histories" (
    "userId" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_view_histories_pkey" PRIMARY KEY ("userId","jobId","viewedAt")
);

-- CreateIndex
CREATE UNIQUE INDEX "specializations_specializationName_key" ON "specializations"("specializationName");

-- AddForeignKey
ALTER TABLE "job_post_specializations" ADD CONSTRAINT "job_post_specializations_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job_posts"("jobId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_post_specializations" ADD CONSTRAINT "job_post_specializations_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "specializations"("specializationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_post_skills" ADD CONSTRAINT "job_post_skills_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job_posts"("jobId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job_posts"("jobId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_view_histories" ADD CONSTRAINT "job_view_histories_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job_posts"("jobId") ON DELETE CASCADE ON UPDATE CASCADE;
