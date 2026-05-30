-- Sync schema with Prisma (required for exhaustive seed)
ALTER TABLE "agents" ADD COLUMN "address" TEXT,
ADD COLUMN "bankAccountName" TEXT,
ADD COLUMN "bankAccountNo" TEXT,
ADD COLUMN "bankIFSC" TEXT,
ADD COLUMN "kycNotes" TEXT,
ADD COLUMN "kycReviewedAt" TIMESTAMP(3),
ADD COLUMN "kycSubmittedAt" TIMESTAMP(3),
ADD COLUMN "languages" TEXT[],
ADD COLUMN "registrationNo" TEXT,
ADD COLUMN "specializations" TEXT[],
ADD COLUMN "teamSize" INTEGER,
ADD COLUMN "websiteUrl" TEXT,
ADD COLUMN "yearsInBusiness" INTEGER;

ALTER TABLE "students" ADD COLUMN "counselorNotes" TEXT,
ADD COLUMN "profileDetails" JSONB;
