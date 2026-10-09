-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('SIZE_1_10', 'SIZE_11_50', 'SIZE_51_200', 'SIZE_201_500', 'SIZE_501_1000', 'SIZE_1001_5000');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "companies" (
    "companyId" UUID NOT NULL,
    "locationId" UUID,
    "companyName" TEXT NOT NULL,
    "logo" TEXT,
    "description" TEXT,
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "taxCode" TEXT NOT NULL,
    "companySize" "CompanySize" NOT NULL DEFAULT 'SIZE_1_10',
    "industry" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("companyId")
);

-- CreateTable
CREATE TABLE "locations" (
    "locationId" UUID NOT NULL,
    "province" TEXT NOT NULL,
    "district" TEXT,
    "ward" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("locationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_taxCode_key" ON "companies"("taxCode");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("locationId") ON DELETE SET NULL ON UPDATE CASCADE;
