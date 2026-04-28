-- AlterTable
ALTER TABLE "Booking"
ADD COLUMN "amountPaid" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "depositPaid" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- DropIndex
DROP INDEX "Payment_bookingId_key";
