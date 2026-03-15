-- AlterTable
ALTER TABLE "user" ADD COLUMN     "emailNotif" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "private" BOOLEAN NOT NULL DEFAULT false;
