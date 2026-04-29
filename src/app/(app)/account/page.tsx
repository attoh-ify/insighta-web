import { getMe } from "@/lib/api";
import AccountClient from "./AccountClient";

export default async function AccountPage() {
  let user = null;
  let error: string | null = null;
  try {
    const res = await getMe();
    user = res.data ?? res;
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "Failed to load account";
  }
  return <AccountClient user={user} error={error} />;
}