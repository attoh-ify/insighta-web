"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import type { User } from "@/types";

export default function AccountClient({ user, error }: { user: User | null; error: string | null }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    const csrf = document.cookie.split("; ").find((r) => r.startsWith("insighta_csrf="))?.split("=")[1];
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(csrf ? { "x-csrf-token": csrf } : {}) },
    });
    router.push("/login");
  }

  const fields = user ? [
    ["Username", `@${user.username}`],
    ["Email", user.email ?? "—"],
    ["Role", user.role],
    ["Status", user.is_active ? "Active" : "Inactive"],
    ["GitHub ID", user.github_id],
    ["Last Login", user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "—"],
    ["Member Since", new Date(user.created_at).toLocaleString()],
  ] : [];

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "4px" }}>Account</h1>
        <p style={{ color: "var(--ink-300)", fontSize: "0.85rem", fontFamily: "DM Mono, monospace" }}>Your profile and access info</p>
      </div>

      {error && <div style={{ padding: "14px 18px", background: "rgba(255,77,106,0.08)", border: "1px solid rgba(255,77,106,0.2)", borderRadius: "10px", color: "var(--coral)", fontFamily: "DM Mono, monospace", fontSize: "0.85rem", marginBottom: "20px" }}>{error}</div>}

      {user && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
            {user.avatar_url ? (
              <Image src={user.avatar_url} alt={user.username} width={64} height={64} style={{ borderRadius: "50%", border: "2px solid var(--border)" }} />
            ) : (
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--surface-2)", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", color: "var(--acid)" }}>
                {user.username?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>@{user.username}</div>
              <span style={{
                display: "inline-flex", marginTop: "4px", padding: "2px 10px", borderRadius: "9999px",
                fontSize: "0.7rem", fontFamily: "DM Mono, monospace", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em",
                background: user.role === "admin" ? "rgba(200,255,0,0.12)" : "rgba(0,212,255,0.12)",
                color: user.role === "admin" ? "var(--acid)" : "var(--ice)",
              }}>
                {user.role}
              </span>
            </div>
          </div>

          <div className="card" style={{ maxWidth: "520px", marginBottom: "24px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {fields.map(([label, value], i) => (
                  <tr key={label} style={{ borderBottom: i < fields.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td style={{ padding: "12px 20px", width: "160px", fontSize: "0.72rem", fontFamily: "DM Mono, monospace", color: "var(--ink-300)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</td>
                    <td style={{ padding: "12px 20px", fontFamily: "DM Mono, monospace", fontSize: "0.85rem", color: "var(--ink-50)" }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={handleLogout} disabled={loggingOut} className="btn btn-danger">
            {loggingOut ? "Signing out…" : "Sign out"}
          </button>
        </>
      )}
    </div>
  );
}