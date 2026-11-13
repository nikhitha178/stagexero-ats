import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
type CreateJobInput = { title: string; location: string; status: "OPEN" | "CLOSED" };

export async function createJob(input: CreateJobInput) {
  return prisma.job.create({ data: input, include: { _count: { select: { applications: true } } } });
}

export async function listJobs() {
  return prisma.job.findMany({
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getJob(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { _count: { select: { applications: true } } },
  });
  if (!job) throw new AppError("Job not found.", 404);
  return job;
}
