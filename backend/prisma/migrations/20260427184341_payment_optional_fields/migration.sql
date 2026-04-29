-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentType" TEXT,
ADD COLUMN     "recordMethod" TEXT DEFAULT 'MANUAL';
