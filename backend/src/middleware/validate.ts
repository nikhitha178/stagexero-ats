import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/app-error.js";

export const validateBody = (schema: ZodType): RequestHandler => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    next(new AppError("Request validation failed.", 400, result.error.issues.map((issue) => ({
      path: issue.path.join("."), message: issue.message,
    }))));
    return;
  }
  req.body = result.data;
  next();
};

export const validateParams = (schema: ZodType): RequestHandler => (req, _res, next) => {
  const result = schema.safeParse(req.params);
  if (!result.success) {
    next(new AppError("Path parameter validation failed.", 400, result.error.issues.map((issue) => ({
      path: issue.path.join("."), message: issue.message,
    }))));
    return;
  }
  next();
};
