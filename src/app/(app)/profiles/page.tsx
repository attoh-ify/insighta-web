import { getProfiles } from "@/lib/api";
import ProfilesClient from "./ProfilesClient";
import type { ProfileFilters } from "@/types";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function str(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ProfilesPage(props: PageProps) {
  const searchParams = await props.searchParams;

  const filters: ProfileFilters = {
    gender: str(searchParams.gender),
    country_id: str(searchParams.country_id),
    age_group: str(searchParams.age_group),
    min_age: str(searchParams.min_age),
    max_age: str(searchParams.max_age),
    sort_by: str(searchParams.sort_by),
    order: str(searchParams.order),
    page: str(searchParams.page) ?? "1",
    limit: str(searchParams.limit) ?? "10",
  };

  let result = null;
  let error: string | null = null;

  try {
    result = await getProfiles(filters);
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "Failed to load profiles";
  }

  return (
    <ProfilesClient
      initial={result}
      filters={filters}
      error={error}
    />
  );
}