import { NextResponse } from "next/server";
import { generateCsrfToken } from "@/lib/csrf";

export async function POST(request: Request) {
  try {
    const { accessToken, refreshToken, username } = await request.json();

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { error: "Missing tokens" },
        { status: 400 }
      );
    }

    const isProduction = process.env.NODE_ENV === "production";

    const response = NextResponse.json({ success: true });

    response.cookies.set("insighta_access_token", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 180,
    });

    response.cookies.set("insighta_refresh_token", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 300,
    });

    if (username) {
      response.cookies.set("insighta_username", username, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 300,
      });
    }

    // Issue a fresh CSRF token now that the user is authenticated.
    // This replaces any stale token that may have been stripped during the OAuth redirect.
    const csrfToken = await generateCsrfToken();
    response.cookies.set("insighta_csrf", csrfToken, {
      httpOnly: false, // must be readable by JS
      secure: isProduction,
      sameSite: "lax", // lax so it survives cross-origin navigations
      path: "/",
      maxAge: 7200, // 2 hours
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Failed to set tokens" },
      { status: 400 }
    );
  }
}