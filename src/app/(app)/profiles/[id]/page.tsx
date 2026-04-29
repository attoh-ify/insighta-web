import { getProfile } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfileDetailPage(props: PageProps) {
  const params = await props.params;
  const id = params.id;

  let profile;
  try {
    const res = await getProfile(id);
    profile = res.data;
  } catch (e: unknown) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  if (!profile) notFound();

  const fields: [string, string, boolean][] = [
    ["ID", profile.id, true],
    ["Name", profile.name, false],
    ["Gender", profile.gender ?? "—", true],
    ["Gender Probability", profile.gender_probability != null ? `${(profile.gender_probability * 100).toFixed(1)}%` : "—", true],
    ["Age", profile.age != null ? String(profile.age) : "—", true],
    ["Age Group", profile.age_group ?? "—", true],
    ["Country ID", profile.country_id ?? "—", true],
    ["Country Name", profile.country_name ?? "—", false],
    ["Country Probability", profile.country_probability != null ? `${(profile.country_probability * 100).toFixed(1)}%` : "—", true],
    ["Created At", new Date(profile.created_at).toLocaleString(), true],
  ];

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <Link 
          href="/profiles" 
          style={{ 
            fontSize: "0.8rem", 
            fontFamily: "DM Mono, monospace", 
            color: "var(--ink-300)", 
            textDecoration: "none", 
            marginBottom: "12px", 
            display: "inline-block" 
          }}
        >
          ← Back to Profiles
        </Link>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          {profile.name}
        </h1>
        <p style={{ color: "var(--ink-300)", fontSize: "0.8rem", fontFamily: "DM Mono, monospace", marginTop: "4px" }}>
          {profile.id}
        </p>
      </div>

      <div className="card" style={{ maxWidth: "560px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {fields.map(([label, value, mono], i) => (
              <tr 
                key={label} 
                style={{ borderBottom: i < fields.length - 1 ? "1px solid var(--border)" : "none" }}
              >
                <td style={{ 
                  padding: "14px 20px", 
                  width: "180px", 
                  fontSize: "0.72rem", 
                  fontFamily: "DM Mono, monospace", 
                  color: "var(--ink-300)", 
                  textTransform: "uppercase", 
                  letterSpacing: "0.06em" 
                }}>
                  {label}
                </td>
                <td style={{ 
                  padding: "14px 20px", 
                  fontFamily: mono ? "DM Mono, monospace" : "Syne, sans-serif", 
                  fontSize: "0.875rem", 
                  color: "var(--ink-50)", 
                  fontWeight: mono ? 400 : 500 
                }}>
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}