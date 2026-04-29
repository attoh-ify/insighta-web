import { NextRequest, NextResponse } from "next/server";
import { generateCsrfToken } from "./lib/csrf";

const PUBLIC_PATHS = ["/login", "/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("insighta_access_token")?.value;

  // Inject CSRF token cookie on every response if not set
  const csrfCookie = request.cookies.get("insighta_csrf")?.value;

  // Redirect unauthenticated users away from protected routes
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (!isPublic && !accessToken) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    const res = NextResponse.redirect(loginUrl);
    return res;
  }

  // Redirect logged-in users away from /login
  if (pathname === "/login" && accessToken) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  const response = NextResponse.next();

  // Set CSRF cookie if absent
  if (!csrfCookie) {
    const token = await generateCsrfToken();
    response.cookies.set("insighta_csrf", token, {
      httpOnly: false, // must be readable by JS to include in headers
      sameSite: "strict",
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};