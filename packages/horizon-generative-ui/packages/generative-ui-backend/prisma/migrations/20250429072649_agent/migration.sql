-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "description" TEXT,
ALTER COLUMN "promptTemplate" DROP NOT NULL;
