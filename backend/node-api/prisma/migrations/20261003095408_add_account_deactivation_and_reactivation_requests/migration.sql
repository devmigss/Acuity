-- CreateEnum
CREATE TYPE "DeactivatedBy" AS ENUM ('SELF', 'ADMIN');

-- CreateEnum
CREATE TYPE "ReactivationRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deactivatedAt" TIMESTAMP(3),
ADD COLUMN     "deactivatedBy" "DeactivatedBy",
ADD COLUMN     "sessionsValidAfter" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ReactivationRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT,
    "status" "ReactivationRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedByAdminId" TEXT,
    "denyReason" TEXT,

    CONSTRAINT "ReactivationRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReactivationRequest" ADD CONSTRAINT "ReactivationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Partial unique index: only one PENDING reactivation request per user
CREATE UNIQUE INDEX "one_pending_reactivation_request_per_user" 
ON "ReactivationRequest"("userId") 
WHERE "status" = 'PENDING';

