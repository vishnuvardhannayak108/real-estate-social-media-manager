import rateLimit from "express-rate-limit";

import { fail } from "../utils/response.js";

export const generalRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => fail(res, "INTERNAL_ERROR", "Too many requests", 429),
});

export const webhookRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => fail(res, "INTERNAL_ERROR", "Too many webhook requests", 429),
});
