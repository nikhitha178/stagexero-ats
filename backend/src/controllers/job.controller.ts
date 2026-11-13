import type { RequestHandler } from "express";
import { createJobSchema } from "../schemas/job.schema.js";
import * as jobService from "../services/job.service.js";

export const createJob: RequestHandler = async (req, res) => {
  const job = await jobService.createJob(createJobSchema.parse(req.body));
  res.status(201).json({ success: true, message: "Job created successfully.", data: job });
};

export const listJobs: RequestHandler = async (_req, res) => {
  const jobs = await jobService.listJobs();
  res.json({ success: true, data: jobs });
};

export const getJob: RequestHandler = async (req, res) => {
  const job = await jobService.getJob(String(req.params.jobId));
  res.json({ success: true, data: job });
};
