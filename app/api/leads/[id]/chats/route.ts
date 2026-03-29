import { NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("lead_id", params.id)
      .order("timestamp", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to fetch chats",
      },
      { status: 500 }
    );
  }
}
