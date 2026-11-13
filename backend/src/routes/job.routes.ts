import { Router } from "express";
import { createApplication, listApplications } from "../controllers/application.controller.js";
import { createJob, getJob, listJobs } from "../controllers/job.controller.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { createApplicationSchema } from "../schemas/application.schema.js";
import { createJobSchema, jobIdParamsSchema } from "../schemas/job.schema.js";

export const jobRouter = Router();

jobRouter.post("/", validateBody(createJobSchema), createJob);
jobRouter.get("/", listJobs);
jobRouter.get("/:jobId", validateParams(jobIdParamsSchema), getJob);
jobRouter.post("/:jobId/applications", validateParams(jobIdParamsSchema), validateBody(createApplicationSchema), createApplication);
jobRouter.get("/:jobId/applications", validateParams(jobIdParamsSchema), listApplications);
