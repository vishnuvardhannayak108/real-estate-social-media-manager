import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { generalRateLimit } from "./middleware/rateLimit.js";
import leadsRouter from "./routes/leads.js";
import statsRouter from "./routes/stats.js";
import uploadRouter from "./routes/upload.js";
import calendlyWebhookRouter from "./routes/webhooks/calendly.js";
import metaWebhookRouter from "./routes/webhooks/meta.js";
import paymentsWebhookRouter from "./routes/webhooks/payments.js";
import { fail, ok } from "./utils/response.js";
const app = express();
app.set("trust proxy", 1);
app.use(helmet({
    contentSecurityPolicy: true,
    frameguard: { action: "deny" },
    noSniff: true,
    xssFilter: true,
}));
app.use(cors({
    origin: env.FRONTEND_ORIGIN,
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
}));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.get("/health", (_req, res) => ok(res, { status: "ok", timestamp: new Date().toISOString() }));
// Webhooks need raw body before any JSON parsing for HMAC verification.
app.use("/api/webhooks/meta", express.raw({ type: "application/json" }), metaWebhookRouter);
app.use("/api/webhooks/calendly", express.raw({ type: "application/json" }), calendlyWebhookRouter);
app.use("/api/webhooks/payments", express.raw({ type: "application/json" }), paymentsWebhookRouter);
app.use(express.json({ limit: "1mb" }));
app.use(generalRateLimit);
app.use("/api/upload", uploadRouter);
app.use("/api/leads", leadsRouter);
app.use("/api/stats", statsRouter);
app.use((_req, res) => fail(res, "NOT_FOUND", "Route not found", 404));
app.use(errorHandler);
app.listen(env.PORT, () => {
    console.log(`Backend API listening on port ${env.PORT}`);
});
