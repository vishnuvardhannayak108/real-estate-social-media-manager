import crypto from "node:crypto";
export function normalizeSignature(signature) {
    return signature.replace(/^sha256=/i, "").trim();
}
export function computeHmacSHA256(rawBody, secret) {
    return crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
}
export function timingSafeCompareHex(aHex, bHex) {
    const a = Buffer.from(aHex, "hex");
    const b = Buffer.from(bHex, "hex");
    if (a.length !== b.length)
        return false;
    return crypto.timingSafeEqual(a, b);
}
export function verifyHmac(rawBody, providedSignature, secret) {
    const expected = computeHmacSHA256(rawBody, secret);
    const provided = normalizeSignature(providedSignature);
    return timingSafeCompareHex(expected, provided);
}
