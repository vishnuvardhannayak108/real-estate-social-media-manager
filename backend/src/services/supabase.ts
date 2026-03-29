import { createClient } from "@supabase/supabase-js";

import { env } from "../config/env.js";

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export async function logSystemEvent(eventType: string, payload: Record<string, unknown>) {
  await supabase.from("system_logs").insert({
    event_type: eventType,
    payload,
    timestamp: new Date().toISOString(),
  });
}
