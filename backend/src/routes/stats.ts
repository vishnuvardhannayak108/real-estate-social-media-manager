import { Router } from "express";

import { requireApiKey } from "../middleware/auth.js";
import { supabase } from "../services/supabase.js";
import { ok } from "../utils/response.js";

const router = Router();

router.get("/", requireApiKey, async (_req, res, next) => {
  try {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const statuses = ["QUALIFYING", "QUALIFIED", "NEGOTIATION", "CALL_BOOKED", "NURTURE", "CLOSED"];
    const postStatuses = ["PENDING", "POSTED", "FAILED"];

    const [statusCounts, postCounts, bookingCount, paymentRows, leadsRows] = await Promise.all([
      Promise.all(
        statuses.map(async (status) => {
          const { count, error } = await supabase
            .from("leads")
            .select("id", { head: true, count: "exact" })
            .eq("status", status);
          if (error) throw error;
          return { status, count: count ?? 0 };
        })
      ),
      Promise.all(
        postStatuses.map(async (status) => {
          const { count, error } = await supabase
            .from("posts")
            .select("id", { head: true, count: "exact" })
            .eq("status", status);
          if (error) throw error;
          return { status, count: count ?? 0 };
        })
      ),
      supabase
        .from("bookings")
        .select("id", { head: true, count: "exact" })
        .gte("created_at", monthStart.toISOString()),
      supabase
        .from("payments")
        .select("amount")
        .eq("status", "PAID")
        .gte("created_at", monthStart.toISOString()),
      supabase
        .from("leads")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true }),
    ]);

    if (bookingCount.error) throw bookingCount.error;
    if (paymentRows.error) throw paymentRows.error;
    if (leadsRows.error) throw leadsRows.error;

    const paymentSum = (paymentRows.data ?? []).reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
    const perDay: Record<string, number> = {};

    for (const row of leadsRows.data ?? []) {
      const key = new Date(row.created_at).toISOString().slice(0, 10);
      perDay[key] = (perDay[key] ?? 0) + 1;
    }

    return ok(res, {
      leadsByStatus: statusCounts,
      postsByStatus: postCounts,
      bookingsThisMonth: bookingCount.count ?? 0,
      paidSumThisMonth: paymentSum,
      leadsPerDay: Object.entries(perDay).map(([date, count]) => ({ date, count })),
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
