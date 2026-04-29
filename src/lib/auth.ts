import { cookies } from "next/headers";

export async function isAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return !!jar.get("insighta_access_token")?.value;
}

export async function getUsername(): Promise<string | null> {
  const jar = await cookies();
  return jar.get("insighta_username")?.value ?? null;
}