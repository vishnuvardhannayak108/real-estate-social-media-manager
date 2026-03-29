import { supabase } from "../services/supabase.js";
export async function isWebhookProcessed(webhookId) {
    const { data, error } = await supabase
        .from("processed_webhooks")
        .select("id")
        .eq("webhook_id", webhookId)
        .maybeSingle();
    if (error)
        throw error;
    return Boolean(data);
}
export async function markWebhookProcessed(webhookId, source) {
    const { error } = await supabase.from("processed_webhooks").insert({
        webhook_id: webhookId,
        source,
        processed_at: new Date().toISOString(),
    });
    if (error)
        throw error;
}
