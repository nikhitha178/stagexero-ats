import type { RequestHandler } from "express";
import { createApplicationSchema, listApplicationsQuerySchema, updateStageSchema } from "../schemas/application.schema.js";
import * as applicationService from "../services/application.service.js";

export const createApplication: RequestHandler = async (req, res) => {
  const application = await applicationService.createCandidateApplication(
    String(req.params.jobId), createApplicationSchema.parse(req.body),
  );
  res.status(201).json({ success: true, message: "Candidate added to the job successfully.", data: application });
};

export const listApplications: RequestHandler = async (req, res) => {
  const filters = listApplicationsQuerySchema.parse(req.query);
  const applications = await applicationService.listJobApplications(String(req.params.jobId), filters);
  res.json({ success: true, data: applications });
};

export const updateStage: RequestHandler = async (req, res) => {
  const { stage } = updateStageSchema.parse(req.body);
  const result = await applicationService.updateApplicationStage(String(req.params.applicationId), stage);
  res.json({
    success: true,
    message: `Application moved from ${result.previousStage} to ${result.newStage}.`,
    data: result,
  });
};
