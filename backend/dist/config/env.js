import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();
const envSchema = z.object({
    PORT: z.coerce.number().int().positive().default(3001),
    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    N8N_WEBHOOK_BASE_URL: z.string().url(),
    META_WEBHOOK_SECRET: z.string().min(1),
    META_VERIFY_TOKEN: z.string().min(1),
    CALENDLY_WEBHOOK_SECRET: z.string().min(1),
    RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    SLACK_WEBHOOK_URL: z.string().url(),
    API_SECRET_KEY: z.string().min(1),
    FRONTEND_ORIGIN: z.string().url().default("http://localhost:3000"),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
    process.exit(1);
}
export const env = parsed.data;
