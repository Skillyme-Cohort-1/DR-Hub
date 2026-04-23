/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `BookSlot` will be added. If there are existing duplicate values, this will fail.
  - Made the column `title` on table `BookSlot` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "BookSlot_slotDate_key";

-- AlterTable
ALTER TABLE "BookSlot" ALTER COLUMN "title" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BookSlot_title_key" ON "BookSlot"("title");
