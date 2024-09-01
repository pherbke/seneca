-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN     "vpRequestLink" TEXT;

-- CreateTable
CREATE TABLE "VPRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "requestLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VPRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VPRequest_applicationId_key" ON "VPRequest"("applicationId");

-- AddForeignKey
ALTER TABLE "VPRequest" ADD CONSTRAINT "VPRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VPRequest" ADD CONSTRAINT "VPRequest_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
