-- AlterTable
ALTER TABLE "job_posts" ADD COLUMN "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];
