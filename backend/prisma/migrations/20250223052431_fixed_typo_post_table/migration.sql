/*
  Warnings:

  - You are about to drop the column `lables` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "lables",
ADD COLUMN     "labels" TEXT[];
