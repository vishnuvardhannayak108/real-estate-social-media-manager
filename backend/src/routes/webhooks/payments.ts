import { Router } from "express";

import { env } from "../../config/env.js";
import { webhookRateLimit } from "../../middleware/rateLimit.js";
import { forwardToN8N } from "../../services/n8n.js";
import { isWebhookProcessed, markWebhookProcessed } from "../../utils/idempotency.js";
import { verifyHmac } from "../../utils/hmac.js";
import { fail, ok } from "../../utils/response.js";

const router = Router();

router.post("/", webhookRateLimit, async (req, res, next) => {
  try {
    if (!Buffer.isBuffer(req.body)) {
      return fail(res, "UNAUTHORIZED", "Raw body required", 401);
    }

    const razorpaySig = req.header("x-razorpay-signature");
    const stripeSig = req.header("stripe-signature");

    let platform: "razorpay" | "stripe";
    let valid = false;

    if (razorpaySig) {
      platform = "razorpay";
      valid = verifyHmac(req.body, razorpaySig, env.RAZORPAY_WEBHOOK_SECRET);
    } else if (stripeSig) {
      platform = "stripe";
      valid = verifyHmac(req.body, stripeSig, env.STRIPE_WEBHOOK_SECRET);
    } else {
      return fail(res, "UNAUTHORIZED", "Missing payment signature", 401);
    }

    if (!valid) {
      console.warn(`HMAC verification failed for ${platform} payment webhook`);
      return fail(res, "UNAUTHORIZED", "HMAC verification failed", 401);
    }

    const payload = JSON.parse(req.body.toString("utf8")) as Record<string, unknown>;
    const paymentId =
      String(
        (payload["payload"] as Record<string, unknown> | undefined)?.["payment"] ??
          payload["payment_id"] ??
          payload["id"] ??
          `${platform}_${Date.now()}`
      );

    if (await isWebhookProcessed(paymentId)) {
      return ok(res, { status: "duplicate", skipped: true });
    }

    await markWebhookProcessed(paymentId, platform);
    await forwardToN8N("/webhook/payment-webhook", payload);

    return ok(res, { received: true, paymentId, platform });
  } catch (error) {
    return next(error);
  }
});

export default router;
