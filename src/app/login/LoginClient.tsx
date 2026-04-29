"use client";

import { useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const GITHUB_LOGIN_URL = `${API_URL}/auth/github?client=web`;

export default function LoginClient() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div
      className="min-h-dvh"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(200,255,0,0.06) 0%, transparent 70%), var(--ink)",
      }}
    >
      {/* wordmark */}
      <div style={{ marginBottom: "48px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{ color: "var(--acid)", fontSize: "1.5rem", fontWeight: 800 }}>⬡</span>
          <span style={{ fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.02em" }}>
            Insighta <span style={{ color: "var(--acid)" }}>Labs+</span>
          </span>
        </div>
        <p style={{ color: "var(--ink-300)", fontSize: "0.85rem", fontFamily: "DM Mono, monospace" }}>
          Profile Intelligence Platform
        </p>
      </div>

      {/* card */}
      <div className="card" style={{ width: "100%", maxWidth: "360px", padding: "32px" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "6px" }}>Welcome back</h1>
        <p style={{ color: "var(--ink-300)", fontSize: "0.85rem", marginBottom: "28px", fontFamily: "DM Mono, monospace" }}>
          Sign in to access your workspace
        </p>

        {error && (
          <div style={{
            background: "rgba(255,77,106,0.1)",
            border: "1px solid rgba(255,77,106,0.25)",
            borderRadius: "8px",
            padding: "10px 14px",
            marginBottom: "20px",
            fontSize: "0.82rem",
            color: "var(--coral)",
            fontFamily: "DM Mono, monospace",
          }}>
            {decodeURIComponent(error)}
          </div>
        )}

        <a
          href={GITHUB_LOGIN_URL}
          className="btn btn-acid"
          style={{ width: "100%", fontSize: "0.95rem", padding: "12px 20px", borderRadius: "10px", textDecoration: "none" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.185 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.2 22 16.447 22 12.021 22 6.484 17.522 2 12 2z" />
          </svg>
          Continue with GitHub
        </a>

        <p style={{ marginTop: "20px", textAlign: "center", fontSize: "0.72rem", color: "var(--ink-400)", fontFamily: "DM Mono, monospace", lineHeight: 1.6 }}>
          Internal platform · access restricted
        </p>
      </div>
    </div>
  );
}