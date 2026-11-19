-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT IF EXISTS "applications_cvId_fkey";

-- DropTable (dọn dẹp các bảng CV legacy cũ không còn dùng trong schema.prisma)
DROP TABLE IF EXISTS "cvs" CASCADE;
DROP TABLE IF EXISTS "cv_templates" CASCADE;
