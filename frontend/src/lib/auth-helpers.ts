import { auth } from "@/auth";
import { getToken } from "next-auth/jwt";
import { cookies, headers } from "next/headers";
import { NextRequest } from "next/server";

/**
 * Extract expiration time from JWT token
 */
function getTokenExpiration(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch (error) {
    console.error("[AUTH] Failed to decode token:", error);
    return null;
  }
}

/**
 * Check if token is expired or will expire soon
 */
function isTokenExpiringSoon(
  token: string,
  bufferSeconds: number = 60
): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true; // If we can't read expiration, consider it expired

  const now = Date.now();
  const timeUntilExpiry = expiration - now;

  return timeUntilExpiry < bufferSeconds * 1000;
}

/**
 * Get server access token with automatic refresh if expired/expiring
 */
export async function getServerAccessToken(): Promise<string | null> {
  const headersList = await headers();
  const cookiesList = await cookies();

  const token = await getToken({
    req: {
      headers: Object.fromEntries(headersList.entries()),
      cookies: Object.fromEntries(
        cookiesList.getAll().map((c) => [c.name, c.value])
      ),
    } as unknown as NextRequest,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  });

  return (token?.accessToken as string) ?? null;
}

export async function getServerSession() {
  return await auth();
}
