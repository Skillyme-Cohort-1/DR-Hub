/*
  Warnings:

  - You are about to drop the column `endTime` on the `BookSlot` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `BookSlot` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[roomId,slotDate]` on the table `BookSlot` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "BookSlot_roomId_startTime_endTime_key";

-- DropIndex
DROP INDEX "BookSlot_roomId_startTime_idx";

-- AlterTable
ALTER TABLE "BookSlot" DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "slotDate" TIMESTAMP(3),
ADD COLUMN     "title" TEXT,
ALTER COLUMN "booked" SET DEFAULT false;

-- CreateIndex
CREATE INDEX "BookSlot_roomId_slotDate_idx" ON "BookSlot"("roomId", "slotDate");

-- CreateIndex
CREATE UNIQUE INDEX "BookSlot_roomId_slotDate_key" ON "BookSlot"("roomId", "slotDate");
