import { NextRequest, NextResponse } from "next/server";
import { handleGoogleCallback } from "@/lib/google-calendar";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // userId passed as state

  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing code or state parameter" },
      { status: 400 }
    );
  }

  try {
    await handleGoogleCallback(code, state);
    return NextResponse.redirect(
      new URL("/dashboard?google=connected", request.url)
    );
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?google=error", request.url)
    );
  }
}
