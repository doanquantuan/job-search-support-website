-- CreateEnum
CREATE TYPE "SalaryType" AS ENUM ('RANGE', 'NEGOTIABLE');

-- CreateEnum
CREATE TYPE "JobLevel" AS ENUM ('INTERN', 'FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD', 'MANAGER');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('NO_REQUIREMENT', 'HIGH_SCHOOL', 'COLLEGE', 'UNIVERSITY', 'POSTGRADUATE');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "JobPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'EXPIRED');

-- CreateTable
CREATE TABLE "occupations" (
    "occupationId" UUID NOT NULL,
    "occupationName" TEXT NOT NULL,

    CONSTRAINT "occupations_pkey" PRIMARY KEY ("occupationId")
);

-- CreateTable
CREATE TABLE "specializations" (
    "specializationId" UUID NOT NULL,
    "specializationName" TEXT NOT NULL,
    "occupationId" UUID NOT NULL,

    CONSTRAINT "specializations_pkey" PRIMARY KEY ("specializationId")
);

-- CreateTable
CREATE TABLE "job_posts" (
    "jobId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "province" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "benefits" TEXT NOT NULL,
    "workingHours" TEXT NOT NULL,
    "salaryType" "SalaryType" NOT NULL,
    "salaryMin" DECIMAL(12,2),
    "salaryMax" DECIMAL(12,2),
    "experienceMin" DECIMAL(4,1),
    "experienceMax" DECIMAL(4,1),
    "jobLevel" "JobLevel" NOT NULL,
    "educationLevel" "EducationLevel" NOT NULL,
    "vacancies" INTEGER,
    "workMode" "WorkMode" NOT NULL,
    "employmentType" "EmploymentType" NOT NULL,
    "status" "JobPostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_posts_pkey" PRIMARY KEY ("jobId")
);

-- CreateTable
CREATE TABLE "job_post_specializations" (
    "jobId" UUID NOT NULL,
    "specializationId" UUID NOT NULL,

    CONSTRAINT "job_post_specializations_pkey" PRIMARY KEY ("jobId","specializationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "occupations_occupationName_key" ON "occupations"("occupationName");

-- CreateIndex
CREATE UNIQUE INDEX "specializations_occupationId_specializationName_key" ON "specializations"("occupationId", "specializationName");

-- CreateIndex
CREATE INDEX "job_post_specializations_specializationId_idx" ON "job_post_specializations"("specializationId");

-- AddForeignKey
ALTER TABLE "specializations" ADD CONSTRAINT "specializations_occupationId_fkey" FOREIGN KEY ("occupationId") REFERENCES "occupations"("occupationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_post_specializations" ADD CONSTRAINT "job_post_specializations_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job_posts"("jobId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_post_specializations" ADD CONSTRAINT "job_post_specializations_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "specializations"("specializationId") ON DELETE CASCADE ON UPDATE CASCADE;
