-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('SIZE_1_50', 'SIZE_51_200', 'SIZE_201_500', 'SIZE_501_1000', 'SIZE_1001_5000');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ADDITIONAL_INFO_REQUIRED');

-- CreateEnum
CREATE TYPE "CompanyDocumentType" AS ENUM ('BUSINESS_LICENSE', 'TAX_CERTIFICATE', 'OTHER');

-- CreateTable
CREATE TABLE "companies" (
    "companyId" UUID NOT NULL,
    "recruiterId" UUID NOT NULL,
    "companyName" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "taxCode" TEXT NOT NULL,
    "companySize" "CompanySize" NOT NULL DEFAULT 'SIZE_1_50',
    "industry" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("companyId")
);

-- CreateTable
CREATE TABLE "company_documents" (
    "documentId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "documentType" "CompanyDocumentType" NOT NULL DEFAULT 'BUSINESS_LICENSE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_documents_pkey" PRIMARY KEY ("documentId")
);

-- CreateTable
CREATE TABLE "company_verifications" (
    "verificationId" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "adminNote" TEXT,
    "verifiedBy" UUID,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_verifications_pkey" PRIMARY KEY ("verificationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_taxCode_key" ON "companies"("taxCode");

-- CreateIndex
CREATE INDEX "companies_recruiterId_idx" ON "companies"("recruiterId");

-- CreateIndex
CREATE INDEX "companies_verificationStatus_idx" ON "companies"("verificationStatus");

-- CreateIndex
CREATE INDEX "companies_province_idx" ON "companies"("province");

-- CreateIndex
CREATE INDEX "companies_companyName_idx" ON "companies"("companyName");

-- CreateIndex
CREATE INDEX "company_documents_companyId_documentType_idx" ON "company_documents"("companyId", "documentType");

-- CreateIndex
CREATE INDEX "company_verifications_companyId_createdAt_idx" ON "company_verifications"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "company_verifications_status_idx" ON "company_verifications"("status");

-- CreateIndex
CREATE INDEX "company_verifications_verifiedBy_idx" ON "company_verifications"("verifiedBy");

-- AddForeignKey
ALTER TABLE "company_documents" ADD CONSTRAINT "company_documents_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("companyId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_verifications" ADD CONSTRAINT "company_verifications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("companyId") ON DELETE CASCADE ON UPDATE CASCADE;
