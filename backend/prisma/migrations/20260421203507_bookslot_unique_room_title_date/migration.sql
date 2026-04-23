/*
  Warnings:

  - A unique constraint covering the columns `[roomId,title,slotDate]` on the table `BookSlot` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "BookSlot_title_key";

-- CreateIndex
CREATE UNIQUE INDEX "BookSlot_roomId_title_slotDate_key" ON "BookSlot"("roomId", "title", "slotDate");
