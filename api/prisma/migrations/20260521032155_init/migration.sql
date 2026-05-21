-- CreateEnum
CREATE TYPE "TenantType" AS ENUM ('AGENT', 'UNIVERSITY', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'AGENT_OWNER', 'AGENT_MANAGER', 'AGENT_COUNSELOR', 'AGENT_TELECALLER', 'UNIVERSITY_ADMIN', 'UNIVERSITY_STAFF', 'STUDENT');

-- CreateEnum
CREATE TYPE "KYCStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RE_UPLOAD_REQUIRED');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('TRIAL', 'STARTER', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "ApplicationStage" AS ENUM ('LEAD', 'DOCS_COLLECTION', 'UNDER_REVIEW', 'SUBMITTED', 'OFFER_RECEIVED', 'VISA_PROCESSING', 'FEES_PAID', 'ENROLLED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('ACADEMIC', 'TEST_SCORES', 'IDENTITY', 'FINANCIAL', 'APPLICATION', 'VISA', 'KYC', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('NOT_UPLOADED', 'UPLOADED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'UNIVERSITY_PAID', 'APPROVED', 'PAID_TO_AGENT', 'DISPUTED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "AIJobType" AS ENUM ('PROPOSAL_GENERATION', 'SOP_WRITING', 'DOCUMENT_FRAUD_CHECK', 'VISA_PREDICTION', 'TRUST_SCORE_CALCULATION', 'INTERVIEW_SIMULATION');

-- CreateEnum
CREATE TYPE "AIJobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "type" "TenantType" NOT NULL,
    "subdomain" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "country" TEXT NOT NULL DEFAULT 'IN',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "subscriptionPlan" "SubscriptionPlan" NOT NULL DEFAULT 'TRIAL',
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "subscriptionId" TEXT,
    "subscriptionExpiresAt" TIMESTAMP(3),
    "logoUrl" TEXT,
    "primaryColor" TEXT DEFAULT '#2b7cff',
    "secondaryColor" TEXT,
    "customDomain" TEXT,
    "universityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "pincode" TEXT,
    "gstNumber" TEXT,
    "panNumber" TEXT,
    "kycStatus" "KYCStatus" NOT NULL DEFAULT 'PENDING',
    "kycRejectedReason" TEXT,
    "parentAgentId" TEXT,
    "visaSuccessRate" DOUBLE PRECISION,
    "conversionRate" DOUBLE PRECISION,
    "fraudIncidents" INTEGER NOT NULL DEFAULT 0,
    "agentScore" DOUBLE PRECISION,
    "isBadgeVerified" BOOLEAN NOT NULL DEFAULT false,
    "walletBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalEarned" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "website" TEXT,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "qsWorldRank" INTEGER,
    "timesHigherRank" INTEGER,
    "shanghaiRank" INTEGER,
    "visaSuccessRate" DOUBLE PRECISION,
    "avgPostStudySalaryUsd" INTEGER,
    "livingCostAnnualUsd" INTEGER,
    "isPartner" BOOLEAN NOT NULL DEFAULT false,
    "partnerSince" TIMESTAMP(3),
    "defaultCommissionPct" DOUBLE PRECISION DEFAULT 15,
    "contactEmail" TEXT,
    "contactName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "intakes" TEXT[],
    "tuitionFeeUsd" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "localFee" DECIMAL(10,2),
    "minGradePercent" DOUBLE PRECISION,
    "minIelts" DOUBLE PRECISION,
    "minPte" DOUBLE PRECISION,
    "minToefl" DOUBLE PRECISION,
    "minGre" INTEGER,
    "minGmat" INTEGER,
    "commissionPct" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "applicationDeadline" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agentId" TEXT,
    "tenantId" TEXT NOT NULL,
    "educationLevel" TEXT,
    "aggregatePct" DOUBLE PRECISION,
    "stream" TEXT,
    "preferredField" TEXT[],
    "ieltsScore" DOUBLE PRECISION,
    "pteScore" DOUBLE PRECISION,
    "toeflScore" INTEGER,
    "duolingoScore" INTEGER,
    "greScore" INTEGER,
    "gmatScore" INTEGER,
    "satScore" INTEGER,
    "annualBudgetInr" INTEGER,
    "preferredCountries" TEXT[],
    "preferredIntake" TEXT,
    "leadSource" TEXT,
    "leadQualityScore" INTEGER,
    "profileScore" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "stage" "ApplicationStage" NOT NULL DEFAULT 'LEAD',
    "intake" TEXT,
    "priority" BOOLEAN NOT NULL DEFAULT false,
    "offerLetterUrl" TEXT,
    "offerType" TEXT,
    "offerConditions" TEXT,
    "offerExpiresAt" TIMESTAMP(3),
    "visaAppliedAt" TIMESTAMP(3),
    "visaDecision" TEXT,
    "visaRejectedReason" TEXT,
    "verifyToken" TEXT,
    "verifyTokenExpiresAt" TIMESTAMP(3),
    "handoffRequested" BOOLEAN NOT NULL DEFAULT false,
    "handoffAssignedTo" TEXT,
    "handoffSlaAt" TIMESTAMP(3),
    "handoffCompletedAt" TIMESTAMP(3),
    "visaProbabilityScore" DOUBLE PRECISION,
    "enrollmentPredScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_stage_history" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fromStage" "ApplicationStage",
    "toStage" "ApplicationStage" NOT NULL,
    "changedById" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_stage_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT,
    "applicationId" TEXT,
    "agentKycId" TEXT,
    "category" "DocumentCategory" NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'UPLOADED',
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentDocId" TEXT,
    "fraudScore" DOUBLE PRECISION,
    "riskLevel" "RiskLevel",
    "fraudFlags" TEXT[],
    "rejectedReason" TEXT,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "shareToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "matchedUniversities" JSONB NOT NULL,
    "budgetInr" INTEGER,
    "targetCountries" TEXT[],
    "targetIntake" TEXT,
    "sopContent" TEXT,
    "sopVersion" INTEGER NOT NULL DEFAULT 0,
    "pdfS3Key" TEXT,
    "pdfGeneratedAt" TIMESTAMP(3),
    "emailSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_ledger" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "grossAmountInr" DECIMAL(12,2) NOT NULL,
    "platformShare" DECIMAL(12,2) NOT NULL,
    "agentShare" DECIMAL(12,2) NOT NULL,
    "tdsAmount" DECIMAL(12,2) NOT NULL,
    "netPayableInr" DECIMAL(12,2) NOT NULL,
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "invoiceUrl" TEXT,
    "payoutRef" TEXT,
    "payoutDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commission_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "metadata" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_jobs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "AIJobType" NOT NULL,
    "status" "AIJobStatus" NOT NULL DEFAULT 'QUEUED',
    "entityId" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_trust_scores" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "documentScore" DOUBLE PRECISION DEFAULT 0,
    "financialScore" DOUBLE PRECISION DEFAULT 0,
    "academicScore" DOUBLE PRECISION DEFAULT 0,
    "interviewScore" DOUBLE PRECISION DEFAULT 0,
    "overallScore" DOUBLE PRECISION DEFAULT 0,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_trust_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "maskedName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "fieldOfStudy" TEXT,
    "budgetRange" TEXT,
    "targetIntake" TEXT,
    "preferredDestinations" TEXT[],
    "intent" TEXT NOT NULL DEFAULT 'WARM',
    "profileScore" INTEGER NOT NULL DEFAULT 0,
    "unlockPrice" INTEGER NOT NULL DEFAULT 999,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketplace_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_unlocks" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "pricePaid" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_unlocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_history" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "razorpayPaymentId" TEXT,
    "razorpaySubscriptionId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_config" (
    "id" TEXT NOT NULL,
    "platformSharePct" DOUBLE PRECISION NOT NULL DEFAULT 30,
    "tdsRatePct" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "minPayoutThreshold" INTEGER NOT NULL DEFAULT 5000,
    "payoutCycleDays" INTEGER NOT NULL DEFAULT 30,
    "defaultLeadPrice" INTEGER NOT NULL DEFAULT 999,
    "leadExpiryDays" INTEGER NOT NULL DEFAULT 30,
    "marketplaceEnabled" BOOLEAN NOT NULL DEFAULT true,
    "trialAiCredits" INTEGER NOT NULL DEFAULT 5,
    "fraudAlertThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.6,
    "autoFraudFlagEnabled" BOOLEAN NOT NULL DEFAULT true,
    "planSTARTERPrice" INTEGER NOT NULL DEFAULT 2999,
    "planPROPrice" INTEGER NOT NULL DEFAULT 5999,
    "planENTERPRISEPrice" INTEGER NOT NULL DEFAULT 9999,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_subdomain_key" ON "tenants"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_email_key" ON "tenants"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_customDomain_key" ON "tenants"("customDomain");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_universityId_key" ON "tenants"("universityId");

-- CreateIndex
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenantId_email_key" ON "users"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "agents_tenantId_key" ON "agents"("tenantId");

-- CreateIndex
CREATE INDEX "universities_country_idx" ON "universities"("country");

-- CreateIndex
CREATE INDEX "courses_universityId_idx" ON "courses"("universityId");

-- CreateIndex
CREATE UNIQUE INDEX "students_userId_key" ON "students"("userId");

-- CreateIndex
CREATE INDEX "students_tenantId_idx" ON "students"("tenantId");

-- CreateIndex
CREATE INDEX "students_agentId_idx" ON "students"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "applications_verifyToken_key" ON "applications"("verifyToken");

-- CreateIndex
CREATE INDEX "applications_tenantId_idx" ON "applications"("tenantId");

-- CreateIndex
CREATE INDEX "applications_studentId_idx" ON "applications"("studentId");

-- CreateIndex
CREATE INDEX "applications_universityId_idx" ON "applications"("universityId");

-- CreateIndex
CREATE UNIQUE INDEX "documents_shareToken_key" ON "documents"("shareToken");

-- CreateIndex
CREATE INDEX "documents_tenantId_idx" ON "documents"("tenantId");

-- CreateIndex
CREATE INDEX "documents_studentId_idx" ON "documents"("studentId");

-- CreateIndex
CREATE INDEX "proposals_studentId_idx" ON "proposals"("studentId");

-- CreateIndex
CREATE INDEX "proposals_tenantId_idx" ON "proposals"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "commission_ledger_applicationId_key" ON "commission_ledger"("applicationId");

-- CreateIndex
CREATE INDEX "commission_ledger_tenantId_idx" ON "commission_ledger"("tenantId");

-- CreateIndex
CREATE INDEX "commission_ledger_agentId_idx" ON "commission_ledger"("agentId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_tenantId_idx" ON "notifications"("tenantId");

-- CreateIndex
CREATE INDEX "ai_jobs_tenantId_idx" ON "ai_jobs"("tenantId");

-- CreateIndex
CREATE INDEX "ai_jobs_entityId_idx" ON "ai_jobs"("entityId");

-- CreateIndex
CREATE UNIQUE INDEX "global_trust_scores_studentId_key" ON "global_trust_scores"("studentId");

-- CreateIndex
CREATE INDEX "activity_logs_tenantId_idx" ON "activity_logs"("tenantId");

-- CreateIndex
CREATE INDEX "activity_logs_entityId_idx" ON "activity_logs"("entityId");

-- CreateIndex
CREATE INDEX "marketplace_leads_intent_idx" ON "marketplace_leads"("intent");

-- CreateIndex
CREATE INDEX "marketplace_leads_isPublished_idx" ON "marketplace_leads"("isPublished");

-- CreateIndex
CREATE INDEX "lead_unlocks_agentId_idx" ON "lead_unlocks"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "lead_unlocks_leadId_agentId_key" ON "lead_unlocks"("leadId", "agentId");

-- CreateIndex
CREATE INDEX "billing_history_tenantId_idx" ON "billing_history"("tenantId");

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_parentAgentId_fkey" FOREIGN KEY ("parentAgentId") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_stage_history" ADD CONSTRAINT "application_stage_history_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_agentKycId_fkey" FOREIGN KEY ("agentKycId") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_ledger" ADD CONSTRAINT "commission_ledger_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_ledger" ADD CONSTRAINT "commission_ledger_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_ledger" ADD CONSTRAINT "commission_ledger_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "global_trust_scores" ADD CONSTRAINT "global_trust_scores_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_unlocks" ADD CONSTRAINT "lead_unlocks_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "marketplace_leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_history" ADD CONSTRAINT "billing_history_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
