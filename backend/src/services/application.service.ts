import { Prisma, type ApplicationStage } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import { validateStageTransition } from "./stage-transition.service.js";

export interface CreateCandidateApplicationInput {
  fullName: string;
  email: string;
  phone?: string | null;
}

export async function createCandidateApplication(jobId: string, input: CreateCandidateApplicationInput) {
  try {
    return await prisma.$transaction(async (tx) => {
      const job = await tx.job.findUnique({ where: { id: jobId }, select: { id: true, status: true } });
      if (!job) throw new AppError("Job not found.", 404);
      if (job.status !== "OPEN") throw new AppError("This job is closed and cannot accept applications.", 409);

      const candidate = await tx.candidate.upsert({
        where: { email: input.email.toLowerCase() },
        create: { fullName: input.fullName, email: input.email.toLowerCase(), phone: input.phone ?? null },
        update: {},
      });

      const existing = await tx.application.findUnique({
        where: { candidateId_jobId: { candidateId: candidate.id, jobId } },
        select: { id: true },
      });
      if (existing) throw new AppError("This candidate has already applied to this job.", 409);

      return tx.application.create({
        data: { candidateId: candidate.id, jobId, stage: "APPLIED" },
        include: { candidate: true },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("This candidate has already applied to this job.", 409);
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      throw new AppError("The application changed concurrently. Please retry.", 409);
    }
    throw error;
  }
}

export async function listJobApplications(jobId: string, filters: { stage?: ApplicationStage; search?: string }) {
  const job = await prisma.job.findUnique({ where: { id: jobId }, select: { id: true } });
  if (!job) throw new AppError("Job not found.", 404);

  return prisma.application.findMany({
    where: {
      jobId,
      ...(filters.stage ? { stage: filters.stage } : {}),
      ...(filters.search ? { candidate: { fullName: { contains: filters.search, mode: "insensitive" } } } : {}),
    },
    include: { candidate: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateApplicationStage(applicationId: string, nextStage: ApplicationStage) {
  try {
    return await prisma.$transaction(async (tx) => {
      const application = await tx.application.findUnique({
        where: { id: applicationId }, include: { candidate: true },
      });
      if (!application) throw new AppError("Application not found.", 404);

      const transition = validateStageTransition(application.stage, nextStage);
      if (!transition.valid) throw new AppError(transition.message, 400);

      // Compare-and-set prevents a stale request from overwriting a concurrent stage update.
      const result = await tx.application.updateMany({
        where: { id: applicationId, stage: application.stage },
        data: { stage: nextStage },
      });
      if (result.count !== 1) throw new AppError("The application stage changed concurrently. Refresh and try again.", 409);

      const updated = await tx.application.findUniqueOrThrow({
        where: { id: applicationId }, include: { candidate: true },
      });
      return { application: updated, previousStage: application.stage, newStage: nextStage };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      throw new AppError("The application stage changed concurrently. Refresh and try again.", 409);
    }
    throw error;
  }
}
