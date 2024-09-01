/*
  Warnings:

  - You are about to drop the `VPRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VPRequest" DROP CONSTRAINT "VPRequest_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "VPRequest" DROP CONSTRAINT "VPRequest_userId_fkey";

-- DropTable
DROP TABLE "VPRequest";
