import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env.js";
import { verifyHmac } from "../utils/hmac.js";
import { fail } from "../utils/response.js";

type EnvKey =
  | "META_WEBHOOK_SECRET"
  | "CALENDLY_WEBHOOK_SECRET"
  | "RAZORPAY_WEBHOOK_SECRET"
  | "STRIPE_WEBHOOK_SECRET";

export function createHmacVerifier(secretEnvKey: EnvKey, headerName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const rawBody = req.body;
    if (!Buffer.isBuffer(rawBody)) {
      return fail(res, "UNAUTHORIZED", "Raw body missing for HMAC verification", 401);
    }

    const signature = req.header(headerName) ?? "";
    if (!signature) {
      return fail(res, "UNAUTHORIZED", `Missing signature header: ${headerName}`, 401);
    }

    const secret = env[secretEnvKey];
    const valid = verifyHmac(rawBody, signature, secret);

    if (!valid) {
      console.warn(`HMAC verification failed for ${req.originalUrl}`);
      return fail(res, "UNAUTHORIZED", "HMAC verification failed", 401);
    }

    return next();
  };
}
