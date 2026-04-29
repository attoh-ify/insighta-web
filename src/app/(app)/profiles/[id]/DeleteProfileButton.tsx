"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProfile } from "@/lib/api-client";
import Spinner from "@/component/ui/Spinner";

export default function DeleteProfileButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this profile? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      // You'll need to use your proxy or ensure CSRF is handled as done in ProfilesClient
      // For simplicity, assuming deleteProfile in @/lib/api handles auth tokens
      await deleteProfile(id);
      router.push("/profiles");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="btn btn-ghost"
      style={{ 
        color: "var(--coral)", 
        fontSize: "0.8rem", 
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}
    >
      {loading ? <Spinner size={14} /> : "×"} Delete Profile
    </button>
  );
}