import { z } from "zod";

export const createJobSchema = z.object({
  title: z.string().trim().min(2).max(120),
  location: z.string().trim().min(2).max(120),
  status: z.enum(["OPEN", "CLOSED"]).optional().default("OPEN"),
});

export const jobIdParamsSchema = z.object({ jobId: z.string().min(1) });
