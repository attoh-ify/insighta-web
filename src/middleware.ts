import { NextRequest, NextResponse } from "next/server";
import { generateCsrfToken } from "./lib/csrf";

const PUBLIC_PATHS = ["/login", "/api/auth", "/auth/success"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("insighta_access_token")?.value;
  const csrfCookie = request.cookies.get("insighta_csrf")?.value;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!isPublic && !accessToken) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && accessToken) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  const response = NextResponse.next();

  // Only set CSRF cookie if absent.
  // Use sameSite: "lax" — "strict" gets stripped on cross-origin redirects
  // (e.g. after GitHub OAuth lands back on the site, breaking Edge/Firefox).
  if (!csrfCookie) {
    const token = await generateCsrfToken();
    response.cookies.set("insighta_csrf", token, {
      httpOnly: false, // must be readable by JS to include in x-csrf-token header
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7200,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};