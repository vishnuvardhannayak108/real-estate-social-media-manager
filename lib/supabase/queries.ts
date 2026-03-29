import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Booking,
  DashboardStats,
  Lead,
  LeadFilters,
  LeadStatus,
  Post,
  PostStatus,
  Chat,
} from "@/lib/supabase/types";

const LEAD_STATUSES: LeadStatus[] = [
  "QUALIFYING",
  "QUALIFIED",
  "NEGOTIATION",
  "CALL_BOOKED",
  "NURTURE",
  "CLOSED",
];

const POST_STATUSES: PostStatus[] = ["PENDING", "POSTED", "FAILED"];

function sanitizeSearch(search: string) {
  return search.replace(/[,%()]/g, " ").trim().slice(0, 100);
}

function throwIfError(error: { message: string } | null, fallback: string): asserts error is null {
  if (error) {
    throw new Error(`${fallback}: ${error.message}`);
  }
}

export async function getLeads(
  filters: LeadFilters
): Promise<{ data: Lead[]; count: number }> {
  const supabase = createAdminClient();

  const page = Math.max(filters.page ?? 1, 1);
  const limit = Math.max(filters.limit ?? 20, 1);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("leads")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.search) {
    const term = sanitizeSearch(filters.search);
    if (term) {
      query = query.or(`instagram_id.ilike.%${term}%,location.ilike.%${term}%`);
    }
  }

  const { data, error, count } = await query;
  throwIfError(error, "Failed to fetch leads");

  return {
    data: (data ?? []) as Lead[],
    count: count ?? 0,
  };
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  throwIfError(error, "Failed to fetch lead");
  return (data as Lead | null) ?? null;
}

export async function getLeadChats(leadId: string): Promise<Chat[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("lead_id", leadId)
    .order("timestamp", { ascending: true });

  throwIfError(error, "Failed to fetch lead chats");
  return (data ?? []) as Chat[];
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<Lead> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();

  throwIfError(error, "Failed to update lead status");
  return data as Lead;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createAdminClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    totalLeadsRes,
    totalPostsRes,
    bookingsRes,
    paidPaymentsRes,
    leadsPerDayRes,
    ...statusResults
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
    ...LEAD_STATUSES.map((status) =>
      supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", status)
    ),
    ...POST_STATUSES.map((status) =>
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", status)
    ),
  ]);

  throwIfError(totalLeadsRes.error, "Failed to count total leads");
  throwIfError(totalPostsRes.error, "Failed to count total posts");
  throwIfError(bookingsRes.error, "Failed to count bookings");
  throwIfError(paidPaymentsRes.error, "Failed to fetch paid payments");
  throwIfError(leadsPerDayRes.error, "Failed to fetch leads per day");

  const leadsByStatus = LEAD_STATUSES.reduce(
    (acc, status, index) => {
      const result = statusResults[index];
      throwIfError(result.error, `Failed to count leads status ${status}`);
      acc[status] = result.count ?? 0;
      return acc;
    },
    {} as Record<LeadStatus, number>
  );

  const postsByStatus = POST_STATUSES.reduce(
    (acc, status, index) => {
      const result = statusResults[LEAD_STATUSES.length + index];
      throwIfError(result.error, `Failed to count posts status ${status}`);
      acc[status] = result.count ?? 0;
      return acc;
    },
    {} as Record<PostStatus, number>
  );

  const revenueThisMonth = (paidPaymentsRes.data ?? []).reduce(
    (sum, payment) => sum + Number(payment.amount ?? 0),
    0
  );

  const leadsPerDayMap: Record<string, number> = {};
  for (const lead of leadsPerDayRes.data ?? []) {
    const key = lead.created_at.slice(0, 10);
    leadsPerDayMap[key] = (leadsPerDayMap[key] ?? 0) + 1;
  }

  return {
    totalLeads: totalLeadsRes.count ?? 0,
    leadsByStatus,
    totalPosts: totalPostsRes.count ?? 0,
    postsByStatus,
    bookingsThisMonth: bookingsRes.count ?? 0,
    revenueThisMonth,
    leadsPerDay: Object.entries(leadsPerDayMap).map(([date, count]) => ({ date, count })),
  };
}

export async function getRecentPosts(limit: number): Promise<Post[]> {
  const supabase = createAdminClient();
  const safeLimit = Math.min(Math.max(limit, 1), 100);

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  throwIfError(error, "Failed to fetch recent posts");
  return (data ?? []) as Post[];
}

export async function getBookingsThisMonth(): Promise<Booking[]> {
  const supabase = createAdminClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .gte("created_at", monthStart)
    .order("created_at", { ascending: false });

  throwIfError(error, "Failed to fetch this month bookings");
  return (data ?? []) as Booking[];
}
