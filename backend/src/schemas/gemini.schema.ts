
import { z } from "zod";
import { APPLICATION_STAGES } from "../services/stage-transition.service.js";

export const copilotQuestionSchema = z.object({
    question: z
        .string()
        .trim()
        .min(1, "Please enter a question.")
        .max(1000, "Question cannot exceed 1000 characters."),
});

export type CopilotQuestionInput = z.infer<
    typeof copilotQuestionSchema
>;

export const copilotConfirmationSchema = z.object({
    applicationId: z.string().min(1, "Application ID is required."),
    newStage: z.enum(APPLICATION_STAGES),
});

export type CopilotConfirmationInput = z.infer<
    typeof copilotConfirmationSchema
>;
