/*
  Warnings:

  - The primary key for the `TestSet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `agentId` on the `TestSet` table. All the data in the column will be lost.
  - You are about to drop the column `expectedResult` on the `TestSet` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `TestSet` table. All the data in the column will be lost.
  - You are about to drop the column `runRecord` on the `TestSet` table. All the data in the column will be lost.
  - Added the required column `name` to the `TestSet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TestSet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `TestSet` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TestSet" DROP CONSTRAINT "TestSet_agentId_fkey";

-- AlterTable
ALTER TABLE "TestSet" DROP CONSTRAINT "TestSet_pkey",
DROP COLUMN "agentId",
DROP COLUMN "expectedResult",
DROP COLUMN "question",
DROP COLUMN "runRecord",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "TestSet_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "TestSet_id_seq";

-- CreateTable
CREATE TABLE "TestCase" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "expectedResult" TEXT NOT NULL,
    "testSetId" TEXT NOT NULL,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestRun" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" TEXT NOT NULL,
    "totalTests" INTEGER NOT NULL,
    "passedTests" INTEGER NOT NULL,
    "failedTests" INTEGER NOT NULL,
    "avgSimilarity" DOUBLE PRECISION NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCaseResult" (
    "id" TEXT NOT NULL,
    "actualResult" TEXT NOT NULL,
    "similarity" DOUBLE PRECISION NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "notes" TEXT,
    "testCaseId" TEXT NOT NULL,
    "testRunId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestCaseResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TestSetToTestRun" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_TestSetToTestRun_AB_unique" ON "_TestSetToTestRun"("A", "B");

-- CreateIndex
CREATE INDEX "_TestSetToTestRun_B_index" ON "_TestSetToTestRun"("B");

-- AddForeignKey
ALTER TABLE "TestSet" ADD CONSTRAINT "TestSet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_testSetId_fkey" FOREIGN KEY ("testSetId") REFERENCES "TestSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestRun" ADD CONSTRAINT "TestRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCaseResult" ADD CONSTRAINT "TestCaseResult_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCaseResult" ADD CONSTRAINT "TestCaseResult_testRunId_fkey" FOREIGN KEY ("testRunId") REFERENCES "TestRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TestSetToTestRun" ADD CONSTRAINT "_TestSetToTestRun_A_fkey" FOREIGN KEY ("A") REFERENCES "TestRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TestSetToTestRun" ADD CONSTRAINT "_TestSetToTestRun_B_fkey" FOREIGN KEY ("B") REFERENCES "TestSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
