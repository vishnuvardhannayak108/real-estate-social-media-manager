import { env } from "../config/env.js";
import { fail } from "../utils/response.js";
export function requireApiKey(req, res, next) {
    const auth = req.header("authorization");
    if (!auth?.startsWith("Bearer ")) {
        return fail(res, "UNAUTHORIZED", "Missing bearer token", 401);
    }
    const token = auth.slice("Bearer ".length).trim();
    if (token !== env.API_SECRET_KEY) {
        return fail(res, "UNAUTHORIZED", "Invalid API key", 401);
    }
    return next();
}
