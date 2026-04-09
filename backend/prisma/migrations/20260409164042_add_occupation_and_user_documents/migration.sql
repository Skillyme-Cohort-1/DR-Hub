-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('APPROVED', 'PENDING', 'DECLINED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "occupation" TEXT NOT NULL DEFAULT 'Lawyer';

-- CreateTable
CREATE TABLE "UserDocument" (
    "id" TEXT NOT NULL,
    "documentName" TEXT NOT NULL,
    "documentFile" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserDocument_userId_idx" ON "UserDocument"("userId");

-- AddForeignKey
ALTER TABLE "UserDocument" ADD CONSTRAINT "UserDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
