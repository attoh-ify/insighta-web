"use client";

import { useRouter } from "next/navigation";
import type { Profile } from "@/types";

interface ProfileTableProps {
  profiles: Profile[];
}

function genderBadge(g: string | null) {
  if (!g) return <span className="badge badge-neutral">—</span>;
  return (
    <span className={`badge ${g === "male" ? "badge-ice" : "badge-coral"}`}>
      {g}
    </span>
  );
}

function ageBadge(group: string | null) {
  const classes: Record<string, string> = {
    child: "badge-coral",
    teen: "badge-ice",
    adult: "badge-acid",
    senior: "badge-neutral",
  };
  const cls = group ? (classes[group] ?? "badge-neutral") : "badge-neutral";
  return <span className={`badge ${cls}`}>{group ?? "—"}</span>;
}

export default function ProfileTable({ profiles }: ProfileTableProps) {
  const router = useRouter();

  if (profiles.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--ink-300)", fontFamily: "DM Mono, monospace", fontSize: "0.85rem" }}>
        No profiles found.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Gender</th>
            <th>Age</th>
            <th>Age Group</th>
            <th>Country</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((p) => (
            <tr key={p.id} onClick={() => router.push(`/profiles/${p.id}`)}>
              <td style={{ fontWeight: 600, color: "var(--ink-50)" }}>{p.name}</td>
              <td>{genderBadge(p.gender)}</td>
              <td style={{ fontFamily: "DM Mono, monospace", fontSize: "0.82rem" }}>{p.age ?? "—"}</td>
              <td>{ageBadge(p.age_group)}</td>
              <td style={{ fontFamily: "DM Mono, monospace", fontSize: "0.82rem" }}>
                {p.country_id ? (
                  <span title={p.country_name ?? undefined}>{p.country_id}</span>
                ) : "—"}
              </td>
              <td style={{ fontFamily: "DM Mono, monospace", fontSize: "0.75rem", color: "var(--ink-300)" }}>
                {new Date(p.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}