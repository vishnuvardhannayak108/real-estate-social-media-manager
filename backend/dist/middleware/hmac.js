import { env } from "../config/env.js";
import { verifyHmac } from "../utils/hmac.js";
import { fail } from "../utils/response.js";
export function createHmacVerifier(secretEnvKey, headerName) {
    return (req, res, next) => {
        const rawBody = req.body;
        if (!Buffer.isBuffer(rawBody)) {
            return fail(res, "UNAUTHORIZED", "Raw body missing for HMAC verification", 401);
        }
        const signature = req.header(headerName) ?? "";
        if (!signature) {
            return fail(res, "UNAUTHORIZED", `Missing signature header: ${headerName}`, 401);
        }
        const secret = env[secretEnvKey];
        const valid = verifyHmac(rawBody, signature, secret);
        if (!valid) {
            console.warn(`HMAC verification failed for ${req.originalUrl}`);
            return fail(res, "UNAUTHORIZED", "HMAC verification failed", 401);
        }
        return next();
    };
}
