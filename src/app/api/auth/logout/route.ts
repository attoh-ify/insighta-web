import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function POST(_req: NextRequest) {
  const jar = await cookies();
  const refreshToken = jar.get("insighta_refresh_token")?.value;
  const accessToken = jar.get("insighta_access_token")?.value;

  if (refreshToken) {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }).catch(() => {});
  }

  const response = NextResponse.json({ status: "success" });
  response.cookies.delete("insighta_access_token");
  response.cookies.delete("insighta_refresh_token");
  response.cookies.delete("insighta_username");
  return response;
}