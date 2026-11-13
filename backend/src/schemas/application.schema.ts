import { z } from "zod";
import { APPLICATION_STAGES } from "../services/stage-transition.service.js";

export const createApplicationSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  phone: z.string().trim().max(30).optional().nullable().transform((value) => value || null),
});

export const listApplicationsQuerySchema = z.object({
  stage: z.enum(APPLICATION_STAGES).optional(),
  search: z.string().trim().max(120).optional(),
});

export const updateStageSchema = z.object({
  stage: z.enum(APPLICATION_STAGES),
});

export const applicationIdParamsSchema = z.object({ applicationId: z.string().min(1) });
