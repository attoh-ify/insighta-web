import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  // Handle GitHub OAuth error
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, req.url)
    );
  }

  // Validate required params
  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/login?error=missing_params", req.url)
    );
  }

  try {
    const backendRedirectUrl = `${API_URL}/auth/github/callback?code=${encodeURIComponent(
      code
    )}&state=${encodeURIComponent(state)}`;
    console.log(backendRedirectUrl)

    return NextResponse.redirect(new URL(backendRedirectUrl));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";

    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(msg)}`, req.url)
    );
  }
}