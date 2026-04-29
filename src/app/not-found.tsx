import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
      <div style={{ fontSize: "4rem", fontWeight: 800, color: "var(--acid)", fontFamily: "DM Mono, monospace", lineHeight: 1 }}>404</div>
      <p style={{ color: "var(--ink-300)", fontFamily: "DM Mono, monospace", fontSize: "0.9rem" }}>Page not found.</p>
      <Link href="/dashboard" className="btn btn-ghost" style={{ marginTop: "8px" }}>← Dashboard</Link>
    </div>
  );
}