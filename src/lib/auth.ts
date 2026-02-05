// Auth stub — replace with real auth (NextAuth, Clerk, etc.) later.
// For MVP, we hardcode or read userId from a cookie/header.

const STUB_USER_ID = process.env.STUB_USER_ID || "stub-user-id";

export async function getCurrentUserId(): Promise<string> {
  // In production, this would verify a session token.
  return STUB_USER_ID;
}
