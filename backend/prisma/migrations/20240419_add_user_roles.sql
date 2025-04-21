-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPERADMIN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

-- Update specific user to SUPERADMIN
UPDATE "users" SET "role" = 'SUPERADMIN' WHERE "email" = 'george@seabreeze.farm'; 