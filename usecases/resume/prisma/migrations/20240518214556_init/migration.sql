/*
  Warnings:

  - You are about to drop the column `title` on the `Job` table. All the data in the column will be lost.
  - Added the required column `position` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "logo" TEXT;

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "title",
ADD COLUMN     "location" TEXT,
ADD COLUMN     "position" TEXT NOT NULL,
ADD COLUMN     "requirements" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "image" TEXT;
