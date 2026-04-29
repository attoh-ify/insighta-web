"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPage: (p: number) => void;
}

export default function Pagination({ page, totalPages, total, onPage }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "20px", flexWrap: "wrap", gap: "10px" }}>
      <span style={{ fontSize: "0.78rem", fontFamily: "DM Mono, monospace", color: "var(--ink-300)" }}>
        {total} total
      </span>
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="btn btn-ghost"
          style={{ padding: "6px 10px", fontSize: "0.8rem" }}
        >
          ←
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`el-${i}`} style={{ padding: "6px 4px", color: "var(--ink-300)", fontSize: "0.8rem" }}>…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className="btn"
              style={{
                padding: "6px 10px",
                fontSize: "0.8rem",
                background: p === page ? "var(--acid)" : "transparent",
                color: p === page ? "var(--ink)" : "var(--ink-200)",
                border: p === page ? "none" : "1px solid var(--border)",
                minWidth: "34px",
              }}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          className="btn btn-ghost"
          style={{ padding: "6px 10px", fontSize: "0.8rem" }}
        >
          →
        </button>
      </div>
    </div>
  );
}