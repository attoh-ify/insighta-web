import { getProfiles } from "@/lib/api";

export default async function DashboardPage() {
  let total = 0, maleCount = 0, femaleCount = 0, recentProfiles: unknown[] = [];

  try {
    const [all, male, female, recent] = await Promise.all([
      getProfiles({ limit: "1", page: "1" }),
      getProfiles({ gender: "male", limit: "1", page: "1" }),
      getProfiles({ gender: "female", limit: "1", page: "1" }),
      getProfiles({ limit: "5", page: "1", sort_by: "created_at", order: "desc" }),
    ]);
    total = all.total;
    maleCount = male.total;
    femaleCount = female.total;
    recentProfiles = recent.data;
  } catch { /* show zeros */ }

  const stats = [
    { label: "Total Profiles", value: total.toLocaleString(), accent: "var(--acid)" },
    { label: "Male", value: maleCount.toLocaleString(), accent: "var(--ice)" },
    { label: "Female", value: femaleCount.toLocaleString(), accent: "var(--coral)" },
    { label: "Other / Unknown", value: (total - maleCount - femaleCount).toLocaleString(), accent: "var(--ink-300)" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "4px" }}>Dashboard</h1>
        <p style={{ color: "var(--ink-300)", fontSize: "0.85rem", fontFamily: "DM Mono, monospace" }}>Platform overview</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px", marginBottom: "36px" }}>
        {stats.map((s) => (
          <div key={s.label} className="card" style={{ padding: "20px 22px" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "DM Mono, monospace", color: s.accent, lineHeight: 1.1, marginBottom: "6px" }}>
              {s.value}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--ink-300)", fontFamily: "DM Mono, monospace", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>Recent Profiles</span>
          <a href="/profiles" style={{ fontSize: "0.78rem", color: "var(--acid)", fontFamily: "DM Mono, monospace", textDecoration: "none" }}>View all →</a>
        </div>
        {recentProfiles.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--ink-300)", fontFamily: "DM Mono, monospace", fontSize: "0.85rem" }}>No profiles yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Gender</th><th>Age</th><th>Country</th><th>Created</th></tr>
            </thead>
            <tbody>
              {(recentProfiles as Array<{id:string;name:string;gender:string|null;age:number|null;country_id:string|null;created_at:string}>).map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td style={{ fontFamily: "DM Mono, monospace", fontSize: "0.82rem" }}>{p.gender ?? "—"}</td>
                  <td style={{ fontFamily: "DM Mono, monospace", fontSize: "0.82rem" }}>{p.age ?? "—"}</td>
                  <td style={{ fontFamily: "DM Mono, monospace", fontSize: "0.82rem" }}>{p.country_id ?? "—"}</td>
                  <td style={{ fontFamily: "DM Mono, monospace", fontSize: "0.75rem", color: "var(--ink-300)" }}>{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}