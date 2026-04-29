"use client";

import { useState, useRef } from "react";
import ProfileTable from "@/component/ui/ProfileTable";
import Pagination from "@/component/ui/Pagination";
import Spinner from "@/component/ui/Spinner";
import type { PaginatedResponse } from "@/types";

const EXAMPLES = [
  "young males from Nigeria",
  "adult females from the US",
  "senior men from Germany",
  "teenagers from Brazil",
];

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastQuery = useRef("");

  async function doSearch(q: string, p = 1) {
    if (!q.trim()) return;
    setLoading(true); setError(null);
    lastQuery.current = q;
    try {
      const params = new URLSearchParams({ q, page: String(p), limit: "10" });
      const res = await fetch(`/api/proxy/api/profiles/search?${params.toString()}`, {
        credentials: "include",
        headers: { "X-API-Version": "1" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Search failed");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "4px" }}>Search</h1>
        <p style={{ color: "var(--ink-300)", fontSize: "0.85rem", fontFamily: "DM Mono, monospace" }}>Natural language profile search</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); doSearch(query, 1); }} style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <input
          className="input"
          style={{ flex: 1, fontSize: "1rem", padding: "12px 16px" }}
          placeholder='e.g. "young males from Nigeria"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <button type="submit" disabled={loading || !query.trim()} className="btn btn-acid" style={{ padding: "12px 22px" }}>
          {loading ? <Spinner size={16} /> : "Search"}
        </button>
      </form>

      {!result && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "32px" }}>
          {EXAMPLES.map((ex) => (
            <button key={ex} onClick={() => { setQuery(ex); doSearch(ex, 1); }} className="btn btn-ghost" style={{ fontSize: "0.78rem", padding: "6px 12px" }}>
              {ex}
            </button>
          ))}
        </div>
      )}

      {error && <div style={{ padding: "14px 18px", background: "rgba(255,77,106,0.08)", border: "1px solid rgba(255,77,106,0.2)", borderRadius: "10px", color: "var(--coral)", fontFamily: "DM Mono, monospace", fontSize: "0.85rem", marginBottom: "16px" }}>{error}</div>}

      {result && (
        <div>
          <p style={{ fontSize: "0.8rem", fontFamily: "DM Mono, monospace", color: "var(--ink-300)", marginBottom: "12px" }}>
            {result.total} result{result.total !== 1 ? "s" : ""} for &ldquo;{lastQuery.current}&rdquo;
          </p>
          <div className="card" style={{ padding: 0, position: "relative" }}>
            {loading && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,15,0.5)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
                <Spinner size={28} />
              </div>
            )}
            <ProfileTable profiles={result.data} />
          </div>
          <Pagination page={result.page} totalPages={result.total_pages} total={result.total} onPage={(p) => doSearch(lastQuery.current, p)} />
        </div>
      )}
    </div>
  );
}