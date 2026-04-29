"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthSuccess() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");

        if (accessToken && refreshToken) {
            // Here you do exactly what your other project does:
            // Call your internal Next.js API route to set the cookies
            fetch("/api/auth/set-tokens", {
                method: "POST",
                body: JSON.stringify({ accessToken, refreshToken }),
            }).then(() => {
                router.push("/dashboard");
            });
        }
    }, [searchParams, router]);

    return <div>Completing login...</div>;
}