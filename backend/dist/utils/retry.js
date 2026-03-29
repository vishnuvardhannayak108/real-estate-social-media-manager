import { supabase } from "../services/supabase.js";
export async function withRetry(fn, maxAttempts = 3, delays = [2000, 10000]) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            if (attempt === maxAttempts) {
                const message = error instanceof Error ? error.message : "Unknown retry error";
                await supabase.from("failed_jobs").insert({
                    job_name: "withRetry",
                    payload: { message },
                    retry_count: attempt,
                    created_at: new Date().toISOString(),
                });
                throw error;
            }
            await new Promise((resolve) => setTimeout(resolve, delays[attempt - 1] || 10000));
        }
    }
    throw new Error("Max retries exceeded");
}
