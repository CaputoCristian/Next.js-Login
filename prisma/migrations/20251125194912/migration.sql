/*
  Warnings:

  - You are about to drop the column `tfa_required` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_database"."Token" ALTER COLUMN "token" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "user_database"."User" DROP COLUMN "tfa_required",
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "providerAccountId" TEXT,
ALTER COLUMN "password" DROP NOT NULL;
