import test from "node:test";
import assert from "node:assert/strict";
import { getAllowedTransitions, validateStageTransition } from "../src/services/stage-transition.service.js";

test("Applied to Screening succeeds", () => {
  assert.deepEqual(validateStageTransition("APPLIED", "SCREENING"), { valid: true });
});

test("Screening to Rejected succeeds", () => {
  assert.deepEqual(validateStageTransition("SCREENING", "REJECTED"), { valid: true });
});

test("Applied to Interview fails because it skips Screening", () => {
  assert.equal(validateStageTransition("APPLIED", "INTERVIEW").valid, false);
});

test("Hired is terminal", () => {
  assert.deepEqual(getAllowedTransitions("HIRED"), []);
  assert.equal(validateStageTransition("HIRED", "REJECTED").valid, false);
});

test("Rejected is terminal", () => {
  assert.deepEqual(getAllowedTransitions("REJECTED"), []);
  assert.equal(validateStageTransition("REJECTED", "APPLIED").valid, false);
});

test("Offer to Hired succeeds", () => {
  assert.deepEqual(validateStageTransition("OFFER", "HIRED"), { valid: true });
});

test("Same-stage transition fails", () => {
  assert.equal(validateStageTransition("INTERVIEW", "INTERVIEW").valid, false);
});

test("Backward transition fails", () => {
  assert.equal(validateStageTransition("INTERVIEW", "SCREENING").valid, false);
});
