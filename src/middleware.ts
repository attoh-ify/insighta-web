import { NextRequest, NextResponse } from "next/server";
import { generateCsrfToken } from "./lib/csrf";

const PUBLIC_PATHS = ["/login", "/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("insighta_access_token")?.value;

  const csrfCookie = request.cookies.get("insighta_csrf")?.value;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (!isPublic && !accessToken) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    const res = NextResponse.redirect(loginUrl);
    return res;
  }

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