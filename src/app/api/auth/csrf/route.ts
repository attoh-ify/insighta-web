import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generateCsrfToken } from "@/lib/csrf";

export async function GET(_req: NextRequest) {
  const token = await generateCsrfToken();

  const res = NextResponse.json({ token });

  res.cookies.set("insighta_csrf", token, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
  });

  return res;
}