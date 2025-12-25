/*
  Warnings:

  - You are about to drop the column `lastSaved` on the `PostDraft` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `PostDraft` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PostDraft_userId_lastSaved_idx";

-- AlterTable
ALTER TABLE "PostDraft" DROP COLUMN "lastSaved",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "PostDraft_userId_updatedAt_idx" ON "PostDraft"("userId", "updatedAt");
