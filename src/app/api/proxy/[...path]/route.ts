import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const MUTATING = ["POST", "PUT", "PATCH", "DELETE"];

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxyRequest(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;

  const jar = await cookies();
  const accessToken = jar.get("insighta_access_token")?.value;
  const refreshToken = jar.get("insighta_refresh_token")?.value;

  const backendPath = "/" + path.join("/");

  if (backendPath.startsWith("/api/proxy")) {
    return NextResponse.json(
      { status: "error", message: "Invalid proxy path" },
      { status: 400 }
    );
  }

  /**
   * CSRF CHECK (Edge-safe + async)
   */
  if (MUTATING.includes(req.method)) {
    const csrfHeader = req.headers.get("x-csrf-token");
    const csrfCookie = req.cookies.get("insighta_csrf")?.value;

    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
      return NextResponse.json(
        { status: "error", message: "Invalid CSRF token" },
        { status: 403 }
      );
    }
  }

  const search = req.nextUrl.search;
  const url = `${API_URL}${backendPath}${search}`;

  /**
   * SAFE HEADER FORWARDING
   */
  const headers = new Headers();

  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  if (backendPath.startsWith("/api/")) {
    headers.set("X-API-Version", "1");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const body =
    req.method !== "GET" && req.method !== "HEAD"
      ? await req.text()
      : undefined;

  let backendRes = await fetch(url, {
    method: req.method,
    headers,
    body,
  });

  /**
   * AUTO REFRESH ON 401
   */
  if (backendRes.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();

      headers.set("Authorization", `Bearer ${data.access_token}`);

      backendRes = await fetch(url, {
        method: req.method,
        headers,
        body,
      });

      const res = await buildResponse(backendRes);

      res.cookies.set("insighta_access_token", data.access_token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 180,
      });

      res.cookies.set("insighta_refresh_token", data.refresh_token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 300,
      });

      return res;
    }

    const res = NextResponse.json(
      { status: "error", message: "Session expired. Please log in again." },
      { status: 401 }
    );

    res.cookies.delete("insighta_access_token");
    res.cookies.delete("insighta_refresh_token");
    res.cookies.delete("insighta_username");

    return res;
  }

  return buildResponse(backendRes);
}

/**
 * RESPONSE NORMALIZER
 */
async function buildResponse(backendRes: Response): Promise<NextResponse> {
  const contentType = backendRes.headers.get("content-type") || "";

  if (contentType.includes("text/csv")) {
    const blob = await backendRes.blob();
    const disposition =
      backendRes.headers.get("content-disposition") || "";

    return new NextResponse(blob, {
      status: backendRes.status,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": disposition,
      },
    });
  }

  let data;
  try {
    data = await backendRes.json();
  } catch {
    data = { message: "Invalid JSON response from backend" };
  }

  return NextResponse.json(data, {
    status: backendRes.status,
  });
}

/**
 * METHOD EXPORTS
 */
export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;