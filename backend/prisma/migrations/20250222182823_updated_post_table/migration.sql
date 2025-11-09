/*
  Warnings:

  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_userId_fkey";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "lables" TEXT[],
ADD COLUMN     "links" TEXT[],
ADD COLUMN     "photos" TEXT[];

-- DropTable
DROP TABLE "Project";
