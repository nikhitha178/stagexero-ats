import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { applicationRouter } from "./routes/application.routes.js";
import { jobRouter } from "./routes/job.routes.js";

export const app = express();
app.disable("x-powered-by");
app.use(
    cors({
        origin: [
            env.FRONTEND_URL,
            "http://localhost:3001",
            "http://localhost:3002",
        ],
    })
);
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_req, res) => res.json({ success: true, message: "StageXero API is running." }));
app.use("/api/jobs", jobRouter);
app.use("/api/applications", applicationRouter);
app.use(notFoundHandler);
app.use(errorHandler);
