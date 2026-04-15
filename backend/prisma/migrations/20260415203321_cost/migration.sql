-- AlterTable
ALTER TABLE "Feedback" ALTER COLUMN "booking_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "cost" INTEGER NOT NULL DEFAULT 0;
