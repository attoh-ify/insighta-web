import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.CSRF_SECRET || "insighta_csrf_secret_change_me"
);

export async function generateCsrfToken(): Promise<string> {
  // We create a tiny, short-lived JWT to act as our CSRF token
  return await new SignJWT({ type: "csrf" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h") // CSRF tokens can last a bit longer
    .sign(SECRET);
}

export async function validateCsrfToken(token: string | null): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, SECRET);
    return true;
  } catch (err) {
    return false;
  }
}