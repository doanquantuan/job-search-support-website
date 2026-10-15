-- CreateEnum
CREATE TYPE "JobSeekingStatus" AS ENUM ('LOOKING', 'OPEN_TO_OFFER', 'NOT_LOOKING');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "fullName" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_seekers" (
    "userId" UUID NOT NULL,
    "jobSeekingStatus" "JobSeekingStatus" NOT NULL DEFAULT 'LOOKING',
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
    "contactEmail" TEXT,
    "phone" TEXT,
    "dateOfBirth" DATE,
    "gender" "Gender",
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
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "description" TEXT,

    CONSTRAINT "educations_pkey" PRIMARY KEY ("educationId")
);

-- CreateTable
CREATE TABLE "experiences" (
    "experienceId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "companyName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "description" TEXT,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("experienceId")
);

-- CreateTable
CREATE TABLE "projects" (
    "projectId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "projectName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "description" TEXT,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("projectId")
);

-- CreateTable
CREATE TABLE "awards" (
    "awardId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "awardName" TEXT NOT NULL,
    "issuer" TEXT,
    "awardDate" DATE,
    "description" TEXT,

    CONSTRAINT "awards_pkey" PRIMARY KEY ("awardId")
);

-- CreateTable
CREATE TABLE "certificates" (
    "certificateId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "certificateName" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "issueDate" DATE NOT NULL,
    "expiryDate" DATE,
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

    CONSTRAINT "skills_pkey" PRIMARY KEY ("skillId")
);

-- CreateTable
CREATE TABLE "profile_skills" (
    "userId" UUID NOT NULL,
    "skillId" UUID NOT NULL,

    CONSTRAINT "profile_skills_pkey" PRIMARY KEY ("userId","skillId")
);

-- CreateIndex
CREATE UNIQUE INDEX "career_preferences_userId_key" ON "career_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "skills_skillName_key" ON "skills"("skillName");

-- AddForeignKey
ALTER TABLE "job_seekers" ADD CONSTRAINT "job_seekers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruiters" ADD CONSTRAINT "recruiters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
