export const APPLICATION_STAGES = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
] as const;

export type ApplicationStage = (typeof APPLICATION_STAGES)[number];

const ALLOWED_TRANSITIONS: Record<ApplicationStage, readonly ApplicationStage[]> = {
  APPLIED: ["SCREENING", "REJECTED"],
  SCREENING: ["INTERVIEW", "REJECTED"],
  INTERVIEW: ["OFFER", "REJECTED"],
  OFFER: ["HIRED", "REJECTED"],
  HIRED: [],
  REJECTED: [],
};

export function getAllowedTransitions(currentStage: ApplicationStage): ApplicationStage[] {
  return [...ALLOWED_TRANSITIONS[currentStage]];
}

export function validateStageTransition(
  currentStage: ApplicationStage,
  nextStage: ApplicationStage,
): { valid: true } | { valid: false; message: string } {
  if (currentStage === nextStage) {
    return { valid: false, message: `Application is already in ${currentStage}.` };
  }

  if (!ALLOWED_TRANSITIONS[currentStage].includes(nextStage)) {
    return {
      valid: false,
      message: `Transition from ${currentStage} to ${nextStage} is not allowed. Allowed next stages: ${ALLOWED_TRANSITIONS[currentStage].join(", ") || "none (terminal stage)"}.`,
    };
  }

  return { valid: true };
}
