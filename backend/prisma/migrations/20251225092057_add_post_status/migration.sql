/*
  Warnings:

  - You are about to drop the column `isDraft` on the `Post` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- DropIndex
DROP INDEX "Post_userId_isDraft_idx";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "isDraft",
ADD COLUMN     "status" "PostStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE INDEX "Post_userId_status_idx" ON "Post"("userId", "status");
