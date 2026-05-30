-- CreateTable
CREATE TABLE "student_journey_events" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "applicationId" TEXT,
    "actorName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_journey_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_journey_events_studentId_occurredAt_idx" ON "student_journey_events"("studentId", "occurredAt");

-- CreateIndex
CREATE INDEX "student_journey_events_tenantId_idx" ON "student_journey_events"("tenantId");

-- AddForeignKey
ALTER TABLE "student_journey_events" ADD CONSTRAINT "student_journey_events_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
