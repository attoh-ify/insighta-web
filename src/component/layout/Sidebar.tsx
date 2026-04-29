"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "◈" },
  { href: "/profiles", label: "Profiles", icon: "◉" },
  { href: "/search", label: "Search", icon: "◎" },
  { href: "/account", label: "Account", icon: "◍" },
];

export default function Sidebar({ username, role }: { username: string; role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    const csrf = document.cookie
      .split("; ")
      .find((r) => r.startsWith("insighta_csrf="))
      ?.split("=")[1];

    await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrf ? { "x-csrf-token": csrf } : {}),
      },
    });
    router.push("/login");
  }

  return (
    <aside style={{
      width: "220px",
      minHeight: "100dvh",
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      padding: "24px 0",
      flexShrink: 0,
    }}>
      {/* wordmark */}
      <div style={{ padding: "0 20px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "var(--acid)", fontSize: "1.2rem", fontWeight: 800 }}>⬡</span>
          <span style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.01em" }}>
            Insighta <span style={{ color: "var(--acid)" }}>Labs+</span>
          </span>
        </div>
      </div>

      {/* nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px", padding: "0 10px" }}>
        {nav.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "8px",
                fontSize: "0.88rem",
                fontWeight: active ? 600 : 400,
                color: active ? "var(--acid)" : "var(--ink-200)",
                background: active ? "rgba(200,255,0,0.07)" : "transparent",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "1rem", opacity: active ? 1 : 0.6 }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* user / logout */}
      <div style={{ padding: "16px 14px 0", borderTop: "1px solid var(--border)", marginTop: "auto" }}>
        <div style={{ marginBottom: "10px" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--ink-100)" }}>
            @{username}
          </div>
          <div style={{
            fontSize: "0.68rem",
            fontFamily: "DM Mono, monospace",
            color: role === "admin" ? "var(--acid)" : "var(--ice)",
            marginTop: "2px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}>
            {role}
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="btn btn-danger"
          style={{ width: "100%", fontSize: "0.8rem", padding: "8px 12px" }}
        >
          {loggingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </aside>
  );
}