import { Router } from "express";
import { createHmacVerifier } from "../../middleware/hmac.js";
import { webhookRateLimit } from "../../middleware/rateLimit.js";
import { forwardToN8N } from "../../services/n8n.js";
import { isWebhookProcessed, markWebhookProcessed } from "../../utils/idempotency.js";
import { ok } from "../../utils/response.js";
const router = Router();
router.post("/", webhookRateLimit, createHmacVerifier("CALENDLY_WEBHOOK_SECRET", "calendly-webhook-signature"), async (req, res, next) => {
    try {
        const payload = JSON.parse(req.body.toString("utf8"));
        const webhookId = payload.event?.uuid ?? `calendly_${Date.now()}`;
        if (await isWebhookProcessed(webhookId)) {
            return ok(res, { status: "duplicate", skipped: true });
        }
        await markWebhookProcessed(webhookId, "calendly");
        await forwardToN8N("/webhook/calendly-webhook", payload);
        return ok(res, { received: true, webhookId });
    }
    catch (error) {
        return next(error);
    }
});
export default router;
