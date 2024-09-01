/*
  Warnings:

  - You are about to drop the column `fileName` on the `CV` table. All the data in the column will be lost.
  - Added the required column `file_name` to the `CV` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CV" DROP COLUMN "fileName",
ADD COLUMN     "file_name" TEXT NOT NULL;
