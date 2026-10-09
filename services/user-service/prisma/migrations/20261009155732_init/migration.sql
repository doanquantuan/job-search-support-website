-- CreateEnum
CREATE TYPE "JobSeekingStatus" AS ENUM ('LOOKING', 'OPEN_TO_OFFER', 'NOT_LOOKING');

-- CreateEnum
CREATE TYPE "CVType" AS ENUM ('UPLOADED', 'BUILT');

-- CreateTable
CREATE TABLE "job_seekers" (
    "userId" UUID NOT NULL,
    "jobSeekingStatus" "JobSeekingStatus" NOT NULL DEFAULT 'OPEN_TO_OFFER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_seekers_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "recruiters" (
    "userId" UUID NOT NULL,
    "position" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "companyId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruiters_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "admins" (
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "profiles" (
    "userId" UUID NOT NULL,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "address" TEXT,
    "githubUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "educations" (
    "educationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "institution" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "description" TEXT,

    CONSTRAINT "educations_pkey" PRIMARY KEY ("educationId")
);

-- CreateTable
CREATE TABLE "experiences" (
    "experienceId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "companyName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "description" TEXT,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("experienceId")
);

-- CreateTable
CREATE TABLE "projects" (
    "projectId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "projectName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "description" TEXT,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("projectId")
);

-- CreateTable
CREATE TABLE "awards" (
    "awardId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "awardName" TEXT NOT NULL,
    "issuer" TEXT,
    "awardDate" TIMESTAMP(3),
    "description" TEXT,

    CONSTRAINT "awards_pkey" PRIMARY KEY ("awardId")
);

-- CreateTable
CREATE TABLE "certificates" (
    "certificateId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "certificateName" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "description" TEXT,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("certificateId")
);

-- CreateTable
CREATE TABLE "career_preferences" (
    "careerPreferenceId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "expectedSalaryMin" DECIMAL(12,2),
    "expectedSalaryMax" DECIMAL(12,2),
    "preferredLocation" TEXT,
    "careerGoal" TEXT,

    CONSTRAINT "career_preferences_pkey" PRIMARY KEY ("careerPreferenceId")
);

-- CreateTable
CREATE TABLE "skills" (
    "skillId" UUID NOT NULL,
    "skillName" TEXT NOT NULL,
    "userId" UUID,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("skillId")
);

-- CreateTable
CREATE TABLE "profile_skills" (
    "userId" UUID NOT NULL,
    "skillId" UUID NOT NULL,

    CONSTRAINT "profile_skills_pkey" PRIMARY KEY ("userId","skillId")
);

-- CreateTable
CREATE TABLE "cv_templates" (
    "templateId" UUID NOT NULL,
    "templateName" TEXT NOT NULL,
    "layout" JSONB,
    "previewUrl" TEXT,

    CONSTRAINT "cv_templates_pkey" PRIMARY KEY ("templateId")
);

-- CreateTable
CREATE TABLE "cvs" (
    "cvId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "templateId" UUID,
    "title" TEXT NOT NULL,
    "type" "CVType" NOT NULL DEFAULT 'UPLOADED',
    "content" JSONB,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cvs_pkey" PRIMARY KEY ("cvId")
);

-- CreateIndex
CREATE UNIQUE INDEX "skills_skillName_key" ON "skills"("skillName");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "job_seekers"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educations" ADD CONSTRAINT "educations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "awards" ADD CONSTRAINT "awards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_preferences" ADD CONSTRAINT "career_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_skills" ADD CONSTRAINT "profile_skills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_skills" ADD CONSTRAINT "profile_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("skillId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cvs" ADD CONSTRAINT "cvs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "job_seekers"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cvs" ADD CONSTRAINT "cvs_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "cv_templates"("templateId") ON DELETE SET NULL ON UPDATE CASCADE;
