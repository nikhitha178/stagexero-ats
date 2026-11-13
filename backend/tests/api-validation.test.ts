
import { before, test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

process.env.DATABASE_URL ??=
  "postgresql://test:test@127.0.0.1:5432/stagexero_test";
process.env.FRONTEND_URL ??= "http://localhost:3000";

let app: (typeof import("../src/app.js"))["app"];

before(async () => {
  const application = await import("../src/app.js");
  app = application.app;
});

test("health endpoint responds without requiring a database query", async () => {
  const response = await request(app).get("/api/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
});

test("job creation rejects invalid input before accessing the database", async () => {
  const response = await request(app)
    .post("/api/jobs")
    .send({ title: "", location: "" });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, "Request validation failed.");
  assert.ok(Array.isArray(response.body.errors));
});

test("stage update rejects an unknown stage before accessing the database", async () => {
  const response = await request(app)
    .patch("/api/applications/application-id/stage")
    .send({ stage: "SHORTLISTED" });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});
