-- AlterTable
ALTER TABLE "specialties" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "icons" DROP NOT NULL;
