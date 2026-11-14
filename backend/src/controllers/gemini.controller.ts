
import type { RequestHandler } from "express";
import { askJobCopilot } from "../services/gemini.service.js";
import { AppError } from "../utils/app-error.js";
import { confirmJobApplicationStage } from "../services/application.service.js";
export const askCopilot: RequestHandler = async (req, res, next) => {
    try {
        const jobId = String(req.params.jobId);
        const { question } = req.body as { question: string };

        const result = await askJobCopilot(jobId, question);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "Gemini API key is not configured."
        ) {
            return next(
                new AppError(
                    "AI copilot is not configured. Add GEMINI_API_KEY to backend/.env.",
                    503
                )
            );
        }

        if (error instanceof Error && error.message === "Job not found.") {
            return next(new AppError("Job not found.", 404));
        }

        const status =
            typeof error === "object" &&
                error !== null &&
                "status" in error
                ? Number(error.status)
                : undefined;

        const cause =
            typeof error === "object" &&
                error !== null &&
                "cause" in error
                ? error.cause
                : undefined;

        const causeCode =
            typeof cause === "object" &&
                cause !== null &&
                "code" in cause
                ? String(cause.code)
                : undefined;

        const isNetworkTimeout =
            error instanceof TypeError &&
            [
                "UND_ERR_HEADERS_TIMEOUT",
                "UND_ERR_CONNECT_TIMEOUT",
                "ECONNRESET",
                "ETIMEDOUT",
                "EAI_AGAIN",
            ].includes(causeCode ?? "");

        if (
            [429, 500, 502, 503, 504].includes(status ?? 0) ||
            isNetworkTimeout
        ) {
            return next(
                new AppError(
                    "Gemini is temporarily unavailable. Please try again shortly.",
                    503
                )
            );
        }

        return next(error);
    }
};

export const confirmCopilotStageChange: RequestHandler = async (
    req,
    res,
    next
) => {
    try {
        const jobId = String(req.params.jobId);
        const { applicationId, newStage } = req.body;

        const result = await confirmJobApplicationStage(
            jobId,
            applicationId,
            newStage
        );

        res.json({
            success: true,
            message: "Candidate stage updated successfully.",
            data: result,
        });
    } catch (error) {
        return next(error);
    }
};
