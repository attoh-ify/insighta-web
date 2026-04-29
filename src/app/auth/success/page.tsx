"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthSuccessInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const username = searchParams.get("username");

    if (!accessToken || !refreshToken) {
      router.replace("/login?error=missing_tokens");
      return;
    }

    fetch("/api/auth/set-tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken, refreshToken, username }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to set tokens");
        // Hard navigate so middleware reads fresh cookies
        window.location.href = "/dashboard";
      })
      .catch(() => {
        router.replace("/login?error=token_error");
      });
  }, [searchParams, router]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--ink)",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "3px solid rgba(200,255,0,0.15)",
          borderTopColor: "var(--acid)",
          animation: "spin 0.7s linear infinite",
        }}
      />
      <p
        style={{
          color: "var(--ink-300)",
          fontFamily: "DM Mono, monospace",
          fontSize: "0.9rem",
        }}
      >
        Completing login…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function AuthSuccess() {
  return (
    <Suspense fallback={null}>
      <AuthSuccessInner />
    </Suspense>
  );
}