-- AlterTable
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "foundedYear" INTEGER;

-- CreateTable
CREATE TABLE IF NOT EXISTS "company_followers" (
    "companyId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "followedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_followers_pkey" PRIMARY KEY ("companyId", "userId"),
    CONSTRAINT "company_followers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("companyId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "company_followers_userId_idx" ON "company_followers"("userId");
CREATE INDEX IF NOT EXISTS "company_followers_companyId_idx" ON "company_followers"("companyId");
