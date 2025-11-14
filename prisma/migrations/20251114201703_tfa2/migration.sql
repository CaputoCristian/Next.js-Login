-- AlterTable
ALTER TABLE "user_database"."User" ADD COLUMN     "tfa_required" BOOLEAN NOT NULL DEFAULT true;
