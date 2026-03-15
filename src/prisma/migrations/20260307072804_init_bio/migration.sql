/*
  Warnings:

  - Made the column `handle` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "bio" TEXT,
ALTER COLUMN "role" SET DEFAULT 'Member',
ALTER COLUMN "handle" SET NOT NULL;
