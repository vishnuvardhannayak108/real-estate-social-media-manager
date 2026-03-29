import { NextResponse } from "next/server";
import { subDays } from "date-fns";

import type { LeadStatus } from "@/lib/types";
import { createAdminClient } from "@/lib/supabase/admin";

const leadStatuses: LeadStatus[] = [
  "QUALIFYING",
  "QUALIFIED",
  "NEGOTIATION",
  "CALL_BOOKED",
  "NURTURE",
  "CLOSED",
];

export async function GET() {
  try {
    const supabase = createAdminClient();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const thirtyDaysAgo = subDays(now, 29).toISOString();
    const eightWeeksAgo = subDays(now, 55).toISOString();

    const [
      totalLeadsRes,
      totalPostsRes,
      bookingsRes,
      paymentsRes,
      leads30Res,
      posts8Res,
      ...statusResponses
    ] = await Promise.all([
      supabase.from("leads").select("id", { count: "exact", head: true }),
      supabase.from("posts").select("id", { count: "exact", head: true }),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .gte("created_at", monthStart),
      supabase
        .from("payments")
        .select("amount")
        .eq("status", "PAID")
        .gte("created_at", monthStart),
      supabase
        .from("leads")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo)
        .order("created_at", { ascending: true }),
      supabase
        .from("posts")
        .select("created_at")
        .gte("created_at", eightWeeksAgo)
        .order("created_at", { ascending: true }),
      ...leadStatuses.map((status) =>
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("status", status)
      ),
    ]);

    const leadsPerDayMap: Record<string, number> = {};
    (leads30Res.data ?? []).forEach((lead) => {
      const key = new Date(lead.created_at).toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
      });
      leadsPerDayMap[key] = (leadsPerDayMap[key] ?? 0) + 1;
    });

    const postsPerWeekMap: Record<string, number> = {};
    (posts8Res.data ?? []).forEach((post) => {
      const date = new Date(post.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const key = weekStart.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
      postsPerWeekMap[key] = (postsPerWeekMap[key] ?? 0) + 1;
    });

    const leadsByStatus = leadStatuses.reduce(
      (acc, status, index) => {
        acc[status] = statusResponses[index].count ?? 0;
        return acc;
      },
      {} as Record<LeadStatus, number>
    );

    const revenueThisMonth = (paymentsRes.data ?? []).reduce(
      (sum, payment) => sum + Number(payment.amount ?? 0),
      0
    );

    return NextResponse.json({
      totalLeads: totalLeadsRes.count ?? 0,
      leadsByStatus,
      totalPosts: totalPostsRes.count ?? 0,
      bookingsThisMonth: bookingsRes.count ?? 0,
      revenueThisMonth,
      leadsPerDay: Object.entries(leadsPerDayMap).map(([date, count]) => ({ date, count })),
      postsPerWeek: Object.entries(postsPerWeekMap).map(([week, count]) => ({ week, count })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to fetch dashboard stats",
      },
      { status: 500 }
    );
  }
}
