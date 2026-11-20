-- AlterTable
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "environmentImages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
