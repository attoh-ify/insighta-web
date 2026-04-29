"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import ProfileTable from "@/component/ui/ProfileTable";
import Pagination from "@/component/ui/Pagination";
import Spinner from "@/component/ui/Spinner";
import type { PaginatedResponse, ProfileFilters } from "@/types";

interface Props {
  initial: PaginatedResponse | null;
  filters: ProfileFilters;
  error: string | null;
}

const AGE_GROUPS = ["child", "teen", "adult", "senior"];
const SORT_FIELDS = ["name", "age", "gender", "country_id", "created_at"];

export default function ProfilesClient({ initial, filters, error }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [gender, setGender] = useState(filters.gender ?? "");
  const [country, setCountry] = useState(filters.country_id ?? "");
  const [ageGroup, setAgeGroup] = useState(filters.age_group ?? "");
  const [minAge, setMinAge] = useState(filters.min_age ?? "");
  const [maxAge, setMaxAge] = useState(filters.max_age ?? "");
  const [sortBy, setSortBy] = useState(filters.sort_by ?? "");
  const [order, setOrder] = useState(filters.order ?? "");

  useEffect(() => {
    setGender(filters.gender ?? "");
    setCountry(filters.country_id ?? "");
    setAgeGroup(filters.age_group ?? "");
    setMinAge(filters.min_age ?? "");
    setMaxAge(filters.max_age ?? "");
    setSortBy(filters.sort_by ?? "");
    setOrder(filters.order ?? "");
  }, [filters]);

  // const [creating, setCreating] = useState(false);
  // const [createName, setCreateName] = useState("");
  // const [createError, setCreateError] = useState<string | null>(null);
  // const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  function pushFilters(overrides: Partial<ProfileFilters> = {}) {
    const p = new URLSearchParams();
    
    const merged = { 
      gender, 
      country_id: country, 
      age_group: ageGroup, 
      min_age: minAge, 
      max_age: maxAge, 
      sort_by: sortBy, 
      order, 
      page: "1", 
      ...overrides 
    };

    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined && v !== "") {
        p.set(k, String(v));
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${p.toString()}`);
    });
  }

  function onPage(page: number) {
    const p = new URLSearchParams(searchParams.toString());
    p.set("page", String(page));
    startTransition(() => {
      router.push(`${pathname}?${p.toString()}`);
    });
  }

  function resetFilters() {
    setGender(""); setCountry(""); setAgeGroup(""); setMinAge(""); setMaxAge(""); setSortBy(""); setOrder("");
    startTransition(() => router.push(pathname));
  }

  // function getCsrf() {
  //   return document.cookie
  //     .split("; ")
  //     .find((r) => r.startsWith("insighta_csrf="))
  //     ?.split("=")[1];
  // }

  // async function handleCreate(e: React.FormEvent) {
  //   e.preventDefault();
  //   setCreateError(null);
  //   setCreateSuccess(null);
  //   if (!createName.trim()) return;
  //   setCreating(true);

  //   try {
  //     const csrf = getCsrf();
  //     const res = await fetch("/api/proxy/api/profiles", {
  //       method: "POST",
  //       credentials: "include",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "X-API-Version": "1",
  //         ...(csrf ? { "x-csrf-token": csrf } : {}),
  //       },
  //       body: JSON.stringify({ name: createName.trim() }),
  //     });

  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data.message || "Failed to create");

  //     setCreateSuccess(`Profile for "${data.data?.name ?? createName}" created!`);
  //     setCreateName("");
  //     router.refresh();
  //   } catch (err: unknown) {
  //     setCreateError(err instanceof Error ? err.message : "Error");
  //   } finally {
  //     setCreating(false);
  //   }
  // }

  async function handleExport() {
    setExporting(true);
    try {
      const p = new URLSearchParams({ format: "csv" });
      if (gender) p.set("gender", gender);
      if (country) p.set("country_id", country);
      if (ageGroup) p.set("age_group", ageGroup);
      if (minAge) p.set("min_age", minAge);
      if (maxAge) p.set("max_age", maxAge);
      if (sortBy) p.set("sort_by", sortBy);
      if (order) p.set("order", order);

      const res = await fetch(`/api/proxy/api/profiles/export?${p.toString()}`, {
        credentials: "include",
        headers: { "X-API-Version": "1" },
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `profiles_${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Export error");
    } finally {
      setExporting(false);
    }
  }

  const profiles = initial?.data ?? [];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "4px" }}>Profiles</h1>
          <p style={{ color: "var(--ink-300)", fontSize: "0.85rem", fontFamily: "DM Mono, monospace" }}>
            {initial ? `${initial.total.toLocaleString()} total · page ${initial.page}/${initial.total_pages}` : ""}
          </p>
        </div>
        <button onClick={handleExport} disabled={exporting} className="btn btn-ghost" style={{ fontSize: "0.82rem" }}>
          {exporting ? <Spinner size={14} /> : "↓"} Export CSV
        </button>
      </div>

      {/* <form onSubmit={handleCreate} style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
        <input className="input" style={{ maxWidth: "280px" }} placeholder="Create profile — enter a name…" value={createName} onChange={(e) => setCreateName(e.target.value)} />
        <button type="submit" disabled={creating || !createName.trim()} className="btn btn-acid" style={{ fontSize: "0.85rem" }}>
          {creating ? <Spinner size={14} /> : "+ Create"}
        </button>
      </form>
      {createError && <p style={{ fontSize: "0.82rem", color: "var(--coral)", fontFamily: "DM Mono, monospace", marginBottom: "12px" }}>{createError}</p>}
      {createSuccess && <p style={{ fontSize: "0.82rem", color: "var(--acid)", fontFamily: "DM Mono, monospace", marginBottom: "12px" }}>{createSuccess}</p>} */}

      <div className="card" style={{ padding: "16px 20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <FSelect label="Gender" value={gender} onChange={setGender} options={[["","Any"],["male","Male"],["female","Female"]]} />
          <FInput label="Country" value={country} onChange={setCountry} placeholder="e.g. NG" width="90px" />
          <FSelect label="Age Group" value={ageGroup} onChange={setAgeGroup} options={[["","Any"],...AGE_GROUPS.map(g=>[g,g[0].toUpperCase()+g.slice(1)] as [string,string])]} />
          <FInput label="Min Age" value={minAge} onChange={setMinAge} placeholder="0" width="70px" />
          <FInput label="Max Age" value={maxAge} onChange={setMaxAge} placeholder="99" width="70px" />
          <FSelect label="Sort by" value={sortBy} onChange={setSortBy} options={[["","Default"],...SORT_FIELDS.map(f=>[f,f] as [string,string])]} />
          <FSelect label="Order" value={order} onChange={setOrder} options={[["","asc"],["asc","asc"],["desc","desc"]]} />
          <div style={{ display: "flex", gap: "6px", marginLeft: "auto" }}>
            <button onClick={resetFilters} className="btn btn-ghost" style={{ fontSize: "0.78rem", padding: "8px 12px" }}>Reset</button>
            <button onClick={() => pushFilters()} className="btn btn-acid" style={{ fontSize: "0.78rem", padding: "8px 14px" }}>Apply</button>
          </div>
        </div>
      </div>

      {error && <div style={{ padding: "16px", background: "rgba(255,77,106,0.08)", border: "1px solid rgba(255,77,106,0.2)", borderRadius: "10px", color: "var(--coral)", fontFamily: "DM Mono, monospace", fontSize: "0.85rem", marginBottom: "16px" }}>{error}</div>}

      <div className="card" style={{ padding: 0, position: "relative" }}>
        {isPending && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,15,0.5)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
            <Spinner size={28} />
          </div>
        )}
        <ProfileTable profiles={profiles} />
      </div>

      {initial && <Pagination page={initial.page} totalPages={initial.total_pages} total={initial.total} onPage={onPage} />}
    </div>
  );
}

function FSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <label style={{ fontSize: "0.65rem", fontFamily: "DM Mono, monospace", color: "var(--ink-300)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input" style={{ width: "auto" }}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

function FInput({ label, value, onChange, placeholder, width = "120px" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; width?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <label style={{ fontSize: "0.65rem", fontFamily: "DM Mono, monospace", color: "var(--ink-300)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
      <input className="input" style={{ width }} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}