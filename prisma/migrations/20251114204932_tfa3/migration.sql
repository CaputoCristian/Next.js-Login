/*
  Warnings:

  - You are about to drop the column `tfa_secret` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_database"."User" DROP COLUMN "tfa_secret";
