// Use the global crypto object (available in Edge and modern Node.js)
const SECRET_KEY = process.env.CSRF_SECRET || "insighta_csrf_secret_change_me";

// Helper to convert string to ArrayBuffer
const encoder = new TextEncoder();

async function getSigningKey() {
  return await crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function generateCsrfToken(): Promise<string> {
  // Generate random nonce using Web Crypto
  const nonceArray = new Uint8Array(16);
  crypto.getRandomValues(nonceArray);
  const nonce = Array.from(nonceArray)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const key = await getSigningKey();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(nonce)
  );

  const sig = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${nonce}.${sig}`;
}

export async function validateCsrfToken(token: string | null): Promise<boolean> {
  if (!token) return false;

  const [nonce, sig] = token.split(".");
  if (!nonce || !sig) return false;

  const key = await getSigningKey();
  const data = encoder.encode(nonce);
  
  // Convert hex signature back to buffer for verification
  const sigBuffer = new Uint8Array(
    sig.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
  );

  return await crypto.subtle.verify("HMAC", key, sigBuffer, data);
}