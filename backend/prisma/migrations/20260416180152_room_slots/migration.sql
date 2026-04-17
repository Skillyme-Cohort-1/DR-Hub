/*
  Warnings:

  - Added the required column `roomId` to the `BookSlot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BookSlot" ADD COLUMN     "roomId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "BookSlot" ADD CONSTRAINT "BookSlot_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
