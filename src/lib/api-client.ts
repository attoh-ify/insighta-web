export async function deleteProfile(id: string): Promise<void> {
  const res = await fetch(`/api/proxy/api/profiles/${id}`, {
    method: "DELETE",
    headers: { "X-API-Version": "1" },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Delete failed" }));
    throw new Error(err.message || "Failed to delete profile");
  }
}