import { env } from "../config/env.js";
import { withRetry } from "../utils/retry.js";
export async function forwardToN8N(path, payload) {
    return withRetry(async () => {
        const response = await fetch(`${env.N8N_WEBHOOK_BASE_URL}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const body = await response.text();
            throw new Error(`n8n forward failed: ${response.status} ${body.slice(0, 200)}`);
        }
        const text = await response.text();
        try {
            return text ? JSON.parse(text) : { ok: true };
        }
        catch {
            return { ok: true, raw: text };
        }
    });
}
