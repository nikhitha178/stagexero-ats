
import { Router } from "express";

import {
    createApplication,
    listApplications,
} from "../controllers/application.controller.js";

import {
    createJob,
    getJob,
    listJobs,
} from "../controllers/job.controller.js";

import {
    askCopilot,
    confirmCopilotStageChange,
} from "../controllers/gemini.controller.js";

import {
    validateBody,
    validateParams,
} from "../middleware/validate.js";

import { createApplicationSchema } from "../schemas/application.schema.js";

import {
    createJobSchema,
    jobIdParamsSchema,
} from "../schemas/job.schema.js";

import {
    copilotQuestionSchema,
    copilotConfirmationSchema,
} from "../schemas/gemini.schema.js";

export const jobRouter = Router();

jobRouter.post("/", validateBody(createJobSchema), createJob);

jobRouter.get("/", listJobs);

jobRouter.get("/:jobId", validateParams(jobIdParamsSchema), getJob);

jobRouter.post(
    "/:jobId/applications",
    validateParams(jobIdParamsSchema),
    validateBody(createApplicationSchema),
    createApplication
);

jobRouter.get(
    "/:jobId/applications",
    validateParams(jobIdParamsSchema),
    listApplications
);

jobRouter.post(
    "/:jobId/copilot",
    validateParams(jobIdParamsSchema),
    validateBody(copilotQuestionSchema),
    askCopilot
);

jobRouter.post(
    "/:jobId/copilot/confirm",
    validateParams(jobIdParamsSchema),
    validateBody(copilotConfirmationSchema),
    confirmCopilotStageChange
);
