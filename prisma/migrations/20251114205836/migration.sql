/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Token` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_database"."Token" DROP CONSTRAINT "Token_id_fkey";

-- AlterTable
ALTER TABLE "user_database"."Token" ADD COLUMN     "email" VARCHAR(64) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Token_email_key" ON "user_database"."Token"("email");
