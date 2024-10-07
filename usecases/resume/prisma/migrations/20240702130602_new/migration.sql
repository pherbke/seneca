/*
  Warnings:

  - You are about to drop the column `VPRequestLink` on the `JobApplication` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JobApplication" DROP COLUMN "VPRequestLink",
ADD COLUMN     "vpRequestLink" TEXT;
