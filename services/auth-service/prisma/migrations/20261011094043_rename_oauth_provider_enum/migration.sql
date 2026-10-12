/*
  Warnings:

  - Changed the type of `provider` on the `oauth_accounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('GOOGLE', 'FACEBOOK', 'GITHUB');

-- AlterTable
ALTER TABLE "oauth_accounts" DROP COLUMN "provider",
ADD COLUMN     "provider" "OAuthProvider" NOT NULL;

-- DropEnum
DROP TYPE "AuthProvider";

-- CreateIndex
CREATE UNIQUE INDEX "oauth_accounts_provider_providerUserId_key" ON "oauth_accounts"("provider", "providerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_accounts_userId_provider_key" ON "oauth_accounts"("userId", "provider");
