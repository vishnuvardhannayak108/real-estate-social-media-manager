import { env } from "../config/env.js";
export async function sendSlackAlert(message) {
    try {
        await fetch(env.SLACK_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: message }),
        });
    }
    catch {
        // Avoid throwing while handling an existing error.
    }
}
