import type { ErrorRequestHandler, RequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/app-error.js";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ success: false, message: error.message, errors: error.errors });
    return;
  }

  if (error instanceof SyntaxError && "status" in error && error.status === 400) {
    res.status(400).json({ success: false, message: "Request body contains invalid JSON.", errors: [] });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      res.status(409).json({ success: false, message: "A record with this unique value already exists.", errors: [] });
      return;
    }
    if (error.code === "P2025") {
      res.status(404).json({ success: false, message: "The requested record was not found.", errors: [] });
      return;
    }
  }

  if (process.env.NODE_ENV !== "production") console.error(error);
  res.status(500).json({ success: false, message: "An unexpected server error occurred.", errors: [] });
};
