import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import type { AppError } from "../types/index.js";
import { logSystemEvent } from "../services/supabase.js";
import { sendSlackAlert } from "../services/slack.js";
import { fail } from "../utils/response.js";

export async function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode =
    err instanceof ZodError
      ? 400
      : err.statusCode && Number.isInteger(err.statusCode)
        ? err.statusCode
        : 500;

  const code =
    err instanceof ZodError
      ? "VALIDATION_ERROR"
      : err.code ??
        (statusCode === 401
          ? "UNAUTHORIZED"
          : statusCode === 404
            ? "NOT_FOUND"
            : "INTERNAL_ERROR");

  const message =
    err instanceof ZodError
      ? "Validation failed"
      : statusCode === 500
        ? "Internal server error"
        : err.message;

  console.error("API error", {
    route: req.originalUrl,
    method: req.method,
    statusCode,
    message: err.message,
  });

  await logSystemEvent("api_error", {
    route: req.originalUrl,
    method: req.method,
    statusCode,
    code,
    message: err.message,
  });

  if ((err.retryCount ?? 0) >= 3) {
    await sendSlackAlert(`High retry error on ${req.originalUrl}: ${err.message}`);
  }

  return fail(res, code, message, statusCode);
}
