/*
  Warnings:

  - Added the required column `recruiterId` to the `companies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "VerificationStatus" ADD VALUE 'APPROVED';
ALTER TYPE "VerificationStatus" ADD VALUE 'ADDITIONAL_INFO_REQUIRED';

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "adminNote" TEXT,
ADD COLUMN     "businessLicenseUrl" TEXT,
ADD COLUMN     "environmentPhotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "recruiterId" UUID NOT NULL,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedBy" UUID;
