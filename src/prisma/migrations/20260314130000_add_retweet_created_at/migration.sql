-- AlterTable
ALTER TABLE "Retweet" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Retweet_createdAt_idx" ON "Retweet"("createdAt");
