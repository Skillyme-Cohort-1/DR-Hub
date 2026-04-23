/*
  Warnings:

  - A unique constraint covering the columns `[slotDate]` on the table `BookSlot` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "BookSlot_roomId_slotDate_key";

-- CreateIndex
CREATE UNIQUE INDEX "BookSlot_slotDate_key" ON "BookSlot"("slotDate");
