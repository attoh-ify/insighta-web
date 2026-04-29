import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { accessToken, refreshToken } = await request.json();

        const response = NextResponse.json({ success: true });

        // Set Access Token Cookie
        response.cookies.set("insighta_access_token", accessToken, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 3, // 3 minutes to match backend
        });

        // Set Refresh Token Cookie
        response.cookies.set("insighta_refresh_token", refreshToken, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 5, // 5 minutes to match backend
        });

        return response;
    } catch (error) {
        return NextResponse.json({ error: "Failed to set tokens" }, { status: 400 });
    }
}