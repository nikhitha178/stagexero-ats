import { Router } from "express";
import { updateStage } from "../controllers/application.controller.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { applicationIdParamsSchema, updateStageSchema } from "../schemas/application.schema.js";

export const applicationRouter = Router();
applicationRouter.patch("/:applicationId/stage", validateParams(applicationIdParamsSchema), validateBody(updateStageSchema), updateStage);
