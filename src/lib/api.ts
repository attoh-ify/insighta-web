import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type {
  PaginatedResponse,
  ProfileFilters,
  SingleProfileResponse,
  TokenResponse,
  User,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ── low-level fetch ──────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (path.startsWith("/api/")) {
    headers["X-API-Version"] = "1";
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(err.message || "Request failed", res.status);
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ApiError";
  }
}

// ── auth helpers ─────────────────────────────────────────────────────────────

export async function getTokensFromCookies() {
  const jar = await cookies();
  return {
    accessToken: jar.get("insighta_access_token")?.value ?? null,
    refreshToken: jar.get("insighta_refresh_token")?.value ?? null,
  };
}

export async function refreshTokens(): Promise<string | null> {
  const { refreshToken } = await getTokensFromCookies();
  if (!refreshToken) return null;
  try {
    const data = await apiFetch<TokenResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    return data.access_token;
  } catch {
    return null;
  }
}

export async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { accessToken } = await getTokensFromCookies();

  if (!accessToken) {
    redirect("/login");
  }

  try {
    return await apiFetch<T>(path, options, accessToken);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      const newToken = await refreshTokens();
      if (!newToken) redirect("/login");
      return apiFetch<T>(path, options, newToken);
    }
    throw err;
  }
}

// ── profile API wrappers ─────────────────────────────────────────────────────

export function buildProfileQuery(filters: ProfileFilters): string {
  const params = new URLSearchParams();
  if (filters.gender) params.set("gender", filters.gender);
  if (filters.country_id) params.set("country_id", filters.country_id);
  if (filters.age_group) params.set("age_group", filters.age_group);
  if (filters.min_age) params.set("min_age", filters.min_age);
  if (filters.max_age) params.set("max_age", filters.max_age);
  if (filters.sort_by) params.set("sort_by", filters.sort_by);
  if (filters.order) params.set("order", filters.order);
  params.set("page", filters.page ?? "1");
  params.set("limit", filters.limit ?? "10");
  return params.toString();
}

export async function getProfiles(filters: ProfileFilters = {}): Promise<PaginatedResponse> {
  const qs = buildProfileQuery(filters);
  return authFetch<PaginatedResponse>(`/api/profiles?${qs}`);
}

export async function getProfile(id: string): Promise<SingleProfileResponse> {
  return authFetch<SingleProfileResponse>(`/api/profiles/${id}`);
}

export async function searchProfiles(q: string, page = 1, limit = 10): Promise<PaginatedResponse> {
  return authFetch<PaginatedResponse>(
    `/api/profiles/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`
  );
}

export async function createProfile(name: string): Promise<SingleProfileResponse> {
  console.log("got here")
  return authFetch<SingleProfileResponse>("/api/profiles", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function getMe(): Promise<{ status: string; data: User }> {
  return authFetch<{ status: string; data: User }>("/auth/me");
}