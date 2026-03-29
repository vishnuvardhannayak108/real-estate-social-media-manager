import { Router } from "express";

import { env } from "../../config/env.js";
import { createHmacVerifier } from "../../middleware/hmac.js";
import { webhookRateLimit } from "../../middleware/rateLimit.js";
import { forwardToN8N } from "../../services/n8n.js";
import { logSystemEvent } from "../../services/supabase.js";
import { isWebhookProcessed, markWebhookProcessed } from "../../utils/idempotency.js";
import { fail, ok } from "../../utils/response.js";

const router = Router();

router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === env.META_VERIFY_TOKEN) {
    return res.status(200).send(String(challenge ?? ""));
  }

  return fail(res, "UNAUTHORIZED", "Meta verify token mismatch", 401);
});

router.post("/", webhookRateLimit, createHmacVerifier("META_WEBHOOK_SECRET", "x-hub-signature-256"), async (req, res, next) => {
  try {
    const payload = JSON.parse(req.body.toString("utf8")) as {
      entry?: Array<{ id?: string; time?: number }>;
    };

    const webhookId = `${payload.entry?.[0]?.id ?? "unknown"}_${payload.entry?.[0]?.time ?? Date.now()}`;

    if (await isWebhookProcessed(webhookId)) {
      return ok(res, { status: "duplicate", skipped: true });
    }

    await markWebhookProcessed(webhookId, "meta");
    await forwardToN8N("/webhook/meta-webhook", payload);
    await logSystemEvent("meta_webhook_received", { webhookId });

    return ok(res, { received: true, webhookId });
  } catch (error) {
    return next(error);
  }
});

export default router;
