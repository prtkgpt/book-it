import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getGoogleAuthUrl } from "@/lib/google-calendar";

export async function GET() {
  const userId = await getCurrentUserId();
  const authUrl = getGoogleAuthUrl(userId);
  return NextResponse.redirect(authUrl);
}
