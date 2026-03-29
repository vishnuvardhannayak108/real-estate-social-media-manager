import { NextResponse } from "next/server";
import { z } from "zod";

const uploadSchema = z.object({
  video_url: z.string().url(),
  caption: z.string().min(1).max(2200),
  hashtags: z.string().optional().default(""),
  platforms: z
    .array(z.enum(["instagram", "facebook", "youtube"]))
    .min(1, "Select at least one platform"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = uploadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid payload",
        },
        { status: 400 }
      );
    }

    const baseUrl = process.env.N8N_WEBHOOK_BASE_URL;
    if (!baseUrl) {
      return NextResponse.json(
        { success: false, message: "N8N webhook base URL is not configured" },
        { status: 500 }
      );
    }

    const webhookResponse = await fetch(`${baseUrl}/webhook/content-upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed.data),
    });

    if (!webhookResponse.ok) {
      const detail = await webhookResponse.text();
      return NextResponse.json(
        {
          success: false,
          message: detail || "Webhook rejected the request",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Upload queued successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unexpected server error",
      },
      { status: 500 }
    );
  }
}
