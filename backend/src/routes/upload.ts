import { Router } from "express";
import { z } from "zod";

import { requireApiKey } from "../middleware/auth.js";
import { forwardToN8N } from "../services/n8n.js";
import { ok, fail } from "../utils/response.js";

const router = Router();

const uploadSchema = z.object({
  video_url: z.string().url(),
  caption: z.string().max(2200),
  hashtags: z.string().optional(),
});

router.post("/", requireApiKey, async (req, res, next) => {
  try {
    const parsed = uploadSchema.safeParse(req.body);
    if (!parsed.success) {
      return fail(res, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid payload", 400);
    }

    const response = await forwardToN8N("/webhook/content-upload", parsed.data);
    return ok(res, response);
  } catch (error) {
    return next(error);
  }
});

export default router;
