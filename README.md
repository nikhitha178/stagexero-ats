# StageXero ATS

A full-stack Applicant Tracking System (ATS) assessment project for StageXero. Recruiters can create jobs, add candidates, manage applications through a six-stage hiring pipeline, and use an AI copilot to query job-specific records and propose actions for human confirmation.

## Current implementation status

| Feature | Status |
|---|---|
| Prisma PostgreSQL schema and initial SQL migration | Implemented; database execution pending |
| Express server, CORS, health endpoint | Implemented; runtime verification pending |
| Job create/list/detail APIs | Implemented; database verification pending |
| Candidate reuse and application creation | Implemented; database verification pending |
| Application search and stage filtering | Implemented; database verification pending |
| Centralized stage-transition service | Implemented; 8 unit cases present |
| Stage update API with compare-and-set protection | Implemented; database verification pending |
| Idempotent seed data | Implemented; database verification pending |
| Frontend, AI copilot, human confirmation | Not yet implemented |

## Technology stack

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, Axios, Lucide React, Sonner
- Backend: Node.js, Express 5, TypeScript, Prisma 6, PostgreSQL, Zod
- AI (planned): Google Gemini through server-side `@google/genai`
- Tests: Node test runner, Supertest API validation tests

## Architecture

`Next.js UI → Express REST API → Routes → Controllers → Services → Prisma → PostgreSQL`

Business rules live in services. Controllers handle HTTP request/response mapping. Zod validates request bodies and query parameters. Centralized middleware formats errors. The AI copilot (planned) may propose a stage change but must never write to the database; the recruiter confirms through the normal stage-update endpoint.

## Database design

- `Job` has many `Application` records.
- `Candidate` has many `Application` records.
- `Application` joins a candidate to a job and stores its stage.
- Candidate email is globally unique.
- `(candidateId, jobId)` is unique, preventing duplicate applications to the same job.
- Job status and application stage are PostgreSQL enums.

## Application stages

Allowed transitions:

- `APPLIED → SCREENING` or `REJECTED`
- `SCREENING → INTERVIEW` or `REJECTED`
- `INTERVIEW → OFFER` or `REJECTED`
- `OFFER → HIRED` or `REJECTED`
- `HIRED` and `REJECTED` are terminal.

Same-stage, backward, and skipped transitions are rejected by `validateStageTransition`. The stage-update service checks the current database stage and uses a conditional update inside a serializable transaction to reduce stale-write races.

## API endpoints

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | API health check |
| POST | `/jobs` | Create a job (`title`, `location`, optional `status`) |
| GET | `/jobs` | List jobs with application counts |
| GET | `/jobs/:jobId` | Get job details and application count |
| POST | `/jobs/:jobId/applications` | Add/reuse a candidate and create an application |
| GET | `/jobs/:jobId/applications?stage=INTERVIEW&search=Priya` | List applications with optional stage/name filters |
| PATCH | `/applications/:applicationId/stage` | Change stage after transition validation |

Successful responses use `{ "success": true, "data": ... }`. Errors use `{ "success": false, "message": "...", "errors": [] }`. Expected status codes include 400 for validation/transition errors, 404 for missing records, 409 for duplicates/closed jobs/concurrency conflicts, and 500 for unexpected errors.

## Candidate/application behavior

Candidate email is trimmed and normalized to lowercase. Existing candidates are reused by email. The service checks that the job exists and is open, rejects an existing candidate/job application, and creates the application at `APPLIED`. Candidate/application creation runs in a serializable Prisma transaction. Database uniqueness constraints remain the final duplicate protection.

## Stage-update concurrency safeguard

The service reads the current stage, validates it through the shared transition function, then performs an `updateMany` constrained by both application ID and the previously-read stage. If another request has already changed the stage, the conditional update affects zero rows and the request returns a conflict rather than overwriting the newer state.

## AI copilot (planned)

The intended copilot will receive only records belonging to the selected job. Its tools will be:

- `list_applications`: read applications, optionally filtered by stage.
- `move_stage`: validate a proposed transition and return a proposal only.

For `move_stage`, the backend will verify that the application belongs to the selected job. The frontend will show the candidate, current stage, and requested stage with Confirm and Cancel actions. Only Confirm calls the normal PATCH endpoint, which validates the transition again. The LLM will not receive database write capability or API credentials.

The exact assessment system prompt and Gemini tool declarations will be documented here when the copilot is implemented; they are not claimed to exist yet.

## Environment variables

Copy the examples before running locally:

**Backend** — `backend/.env.example` to `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/stagexero_ats?schema=public"
GEMINI_API_KEY=
PORT=5000
FRONTEND_URL=http://localhost:3000
```

**Frontend** — `frontend/.env.example` to `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Never commit `.env`, `.env.local`, or real API keys.

## Installation and running

Requirements: Node.js 20+, npm, and PostgreSQL 14+.

From the repository root:

```bash
npm install
```

Create a PostgreSQL database named `stagexero_ats`, copy the backend environment example to `backend/.env`, then run:

```bash
npm run db:generate --workspace backend
npm run db:deploy --workspace backend
npm run db:seed --workspace backend
```

Run the backend and frontend in separate terminals:

```bash
npm run dev:backend
npm run dev:frontend
```

The backend listens on port 5000. The frontend is configured for port 3000. On Windows PowerShell, use `Copy-Item backend/.env.example backend/.env` and `Copy-Item frontend/.env.example frontend/.env.local` to copy environment examples.

## Database commands

- `npm run db:generate --workspace backend` — generate Prisma Client.
- `npm run db:migrate --workspace backend` — create/apply a development migration (`prisma migrate dev`).
- `npm run db:deploy --workspace backend` — apply checked-in migrations (`prisma migrate deploy`).
- `npm run db:seed --workspace backend` — insert/update deterministic sample data.

The seed script uses stable job IDs and unique candidate emails/application pairs, so rerunning it updates/reuses existing sample records rather than adding duplicates.

## Testing and checks

```bash
npm test --workspace backend
npm run typecheck --workspace backend
```

The stage-transition suite covers valid forward transitions, rejection, terminal stages, same-stage moves, and backward/skipped moves. API validation tests cover health, invalid job input, and invalid stage input. Database-backed API behavior still needs to be exercised against a configured PostgreSQL instance.

## Screenshots

To be added after the frontend is implemented and verified.

## Assumptions

- Authentication is intentionally omitted because the assessment says it is not required.
- Candidate email is the global identity key.
- Re-adding an existing candidate does not overwrite their existing profile details.
- Applications may remain attached to a job after it is closed; closing a job only prevents new applications.
- Application stage is stored on the application, not on the candidate, because one candidate can apply to multiple jobs.

## Known limitations

- Frontend pages and UI are not implemented yet.
- Gemini integration, copilot tools, and confirmation UI are not implemented yet.
- PostgreSQL migrations, seed execution, API integration tests, and startup have not been verified in this execution environment because npm registry DNS resolution is unavailable and PostgreSQL is not installed.
- No deployment or GitHub remote has been configured.

## Future improvements

- Complete responsive recruiter dashboard, job detail Kanban, candidate modal, and copilot panel.
- Add Gemini tool calling and the mandatory human-confirmation workflow.
- Add PostgreSQL-backed end-to-end API tests and screenshots.
- Add deployment configuration and production observability.
