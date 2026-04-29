import { NextRequest, NextResponse } from "next/server";
import { generateCsrfToken } from "./lib/csrf";

// ADD "/auth/success" to the PUBLIC_PATHS
const PUBLIC_PATHS = ["/login", "/api/auth", "/auth/success"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("insighta_access_token")?.value;

  const csrfCookie = request.cookies.get("insighta_csrf")?.value;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  
  // If the path is not public and there's no token, redirect to login
  if (!isPublic && !accessToken) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // If user is already logged in and tries to access login page, go to dashboard
  if (pathname === "/login" && accessToken) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  const response = NextResponse.next();

  if (!csrfCookie) {
    const token = await generateCsrfToken();
    response.cookies.set("insighta_csrf", token, {
      httpOnly: false,
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