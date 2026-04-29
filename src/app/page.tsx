import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function RootPage() {
  const jar = await cookies();
  if (jar.get("insighta_access_token")?.value) {
    redirect("/dashboard");
  }
  redirect("/login");
}