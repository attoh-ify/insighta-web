import { createHmac, randomBytes } from "crypto";

const SECRET = process.env.CSRF_SECRET || "insighta_csrf_secret_change_me";

export function generateCsrfToken(): string {
  const nonce = randomBytes(16).toString("hex");
  const sig = createHmac("sha256", SECRET).update(nonce).digest("hex");
  return `${nonce}.${sig}`;
}

export function validateCsrfToken(token: string | null): boolean {
  if (!token) return false;

  const [nonce, sig] = token.split(".");
  if (!nonce || !sig) return false;

  const expected = createHmac("sha256", SECRET)
    .update(nonce)
    .digest("hex");

  return sig === expected;
}