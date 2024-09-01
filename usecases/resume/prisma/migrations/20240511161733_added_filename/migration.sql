/*
  Warnings:

  - Added the required column `fileName` to the `CV` table without a default value. This is not possible if the table is not empty.
  - Made the column `cv` on table `CV` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CV" ADD COLUMN     "fileName" TEXT NOT NULL,
ALTER COLUMN "cv" SET NOT NULL;
