/*
  Warnings:

  - You are about to drop the column `private` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "private",
ADD COLUMN     "privateAccount" BOOLEAN NOT NULL DEFAULT false;
