/*
  Warnings:

  - You are about to drop the column `instruction` on the `prescriptions` table. All the data in the column will be lost.
  - Added the required column `instructions` to the `prescriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "prescriptions" DROP COLUMN "instruction",
ADD COLUMN     "instructions" TEXT NOT NULL;
