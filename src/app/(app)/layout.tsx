import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Sidebar from "@/component/layout/Sidebar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function getCurrentUser(accessToken: string) {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const accessToken = jar.get("insighta_access_token")?.value;
  const storedUsername = jar.get("insighta_username")?.value ?? "user";

  if (!accessToken) redirect("/login");

  const user = await getCurrentUser(accessToken);
  const username = user?.username ?? storedUsername;
  const role = user?.role ?? "analyst";

  return (
    <div style={{ display: "flex", minHeight: "100dvh" }}>
      <Sidebar username={username} role={role} />
      <main style={{ flex: 1, overflowY: "auto", padding: "32px 36px" }} className="page-enter">
        {children}
      </main>
    </div>
  );
}