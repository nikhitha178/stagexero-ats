CREATE TYPE "JobStatus" AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE "ApplicationStage" AS ENUM ('APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED');

CREATE TABLE "Job" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "status" "JobStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Candidate" (
  "id" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Application" (
  "id" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "stage" "ApplicationStage" NOT NULL DEFAULT 'APPLIED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Candidate_email_key" ON "Candidate"("email");
CREATE INDEX "Candidate_fullName_idx" ON "Candidate"("fullName");
CREATE INDEX "Job_status_createdAt_idx" ON "Job"("status", "createdAt");
CREATE UNIQUE INDEX "Application_candidateId_jobId_key" ON "Application"("candidateId", "jobId");
CREATE INDEX "Application_jobId_stage_idx" ON "Application"("jobId", "stage");
CREATE INDEX "Application_candidateId_idx" ON "Application"("candidateId");

ALTER TABLE "Application" ADD CONSTRAINT "Application_candidateId_fkey"
  FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey"
  FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
