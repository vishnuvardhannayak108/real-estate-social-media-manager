import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z
    .enum([
      "QUALIFYING",
      "QUALIFIED",
      "NEGOTIATION",
      "CALL_BOOKED",
      "NURTURE",
      "CLOSED",
    ])
    .optional(),
  budget: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  property_type: z.string().nullable().optional(),
  timeline: z.string().nullable().optional(),
});

const statusSchema = z.enum([
  "QUALIFYING",
  "QUALIFIED",
  "NEGOTIATION",
  "CALL_BOOKED",
  "NURTURE",
  "CLOSED",
]);

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const searchParams = request.nextUrl.searchParams;

    const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
    const limit = Math.max(Number(searchParams.get("limit") ?? "20"), 1);
    const rawStatus = searchParams.get("status");
    const status = rawStatus ? statusSchema.safeParse(rawStatus) : null;
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") === "last_message_at" ? "last_message_at" : "created_at";
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("leads")
      .select("*", { count: "exact" })
      .order(sortBy, { ascending: order === "asc" })
      .range(from, to);

    if (status?.success) {
      query = query.eq("status", status.data);
    }

    if (search) {
      query = query.or(`instagram_id.ilike.%${search}%,location.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      data: data ?? [],
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to fetch leads",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }

    const { id, ...updates } = parsed.data;
    const { data, error } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to update lead",
      },
      { status: 500 }
    );
  }
}
