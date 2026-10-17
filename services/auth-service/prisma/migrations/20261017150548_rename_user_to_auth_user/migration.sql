-- 1. Đổi tên bảng users thành auth_users thay vì DROP và CREATE (để giữ nguyên toàn bộ dữ liệu user)
ALTER TABLE "users" RENAME TO "auth_users";

-- 2. Đổi tên khóa chính (Primary Key)
ALTER TABLE "auth_users" RENAME CONSTRAINT "users_pkey" TO "auth_users_pkey";

-- 3. Đổi tên Index Unique email
ALTER INDEX "users_email_key" RENAME TO "auth_users_email_key";

-- 4. Cập nhật lại Foreign Key của oauth_accounts và refresh_tokens trỏ đúng vào auth_users
ALTER TABLE "oauth_accounts" DROP CONSTRAINT IF EXISTS "oauth_accounts_userId_fkey";
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "refresh_tokens" DROP CONSTRAINT IF EXISTS "refresh_tokens_userId_fkey";
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
