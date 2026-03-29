import { Router } from "express";
import { z } from "zod";

import { requireApiKey } from "../middleware/auth.js";
import { supabase } from "../services/supabase.js";
import { ok, fail } from "../utils/response.js";

const router = Router();

function sanitizeSearchTerm(value: string) {
  return value.replace(/[^a-zA-Z0-9 _@.-]/g, "").slice(0, 100);
}

const patchSchema = z.object({
  status: z
    .enum(["QUALIFYING", "QUALIFIED", "NEGOTIATION", "CALL_BOOKED", "NURTURE", "CLOSED"])
    .optional(),
  budget: z.string().optional(),
  location: z.string().optional(),
  property_type: z.string().optional(),
  timeline: z.string().optional(),
});

router.get("/", requireApiKey, async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const limit = Math.max(Number(req.query.limit ?? 20), 1);
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    let query = supabase
      .from("leads")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) query = query.eq("status", status);
    if (search) {
      const safeSearch = sanitizeSearchTerm(search);
      query = query.or(`instagram_id.ilike.%${safeSearch}%,location.ilike.%${safeSearch}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return ok(res, {
      data: data ?? [],
      count: count ?? 0,
      page,
      totalPages: Math.ceil((count ?? 0) / limit),
    });
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id", requireApiKey, async (req, res, next) => {
  try {
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) {
      return fail(res, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid payload", 400);
    }

    const { data, error } = await supabase
      .from("leads")
      .update(parsed.data)
      .eq("id", req.params.id)
      .select("*")
      .single();

    if (error) throw error;
    return ok(res, data);
  } catch (error) {
    return next(error);
  }
});

router.get("/:id/chats", requireApiKey, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("lead_id", req.params.id)
      .order("timestamp", { ascending: true });

    if (error) throw error;
    return ok(res, { data: data ?? [] });
  } catch (error) {
    return next(error);
  }
});

export default router;
