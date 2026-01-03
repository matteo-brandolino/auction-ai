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
function isTokenExpiringSoon(token: string, bufferSeconds: number = 60): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true; // If we can't read expiration, consider it expired

  const now = Date.now();
  const timeUntilExpiry = expiration - now;

  return timeUntilExpiry < bufferSeconds * 1000;
}

/**
 * Get server access token with automatic refresh if expired/expiring
 * This function will attempt to get a fresh token up to 2 times if the token is expired
 */
export async function getServerAccessToken(): Promise<string | null> {
  const headersList = await headers();
  const cookiesList = await cookies();

  const maxAttempts = 2;
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt++;

    const token = await getToken({
      req: {
        headers: Object.fromEntries(headersList),
        cookies: Object.fromEntries(
          cookiesList.getAll().map((c) => [c.name, c.value])
        ),
      } as unknown as NextRequest,
      secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    });

    if (!token?.accessToken) {
      console.log("[AUTH] No access token found in session");
      return null;
    }

    const accessToken = token.accessToken as string;

    if (isTokenExpiringSoon(accessToken, 60)) {
      console.log(`[AUTH] Token expiring soon (attempt ${attempt}/${maxAttempts}), triggering refresh...`);

      // Wait a bit for the jwt callback to complete the refresh
      await new Promise(resolve => setTimeout(resolve, 500));

      // Continue to next iteration to get the refreshed token
      continue;
    }

    // Token is valid
    const expiration = getTokenExpiration(accessToken);
    if (expiration) {
      const timeUntilExpiry = Math.round((expiration - Date.now()) / 1000);
      console.log(`[AUTH] Returning valid token (expires in ${timeUntilExpiry}s)`);
    }

    return accessToken;
  }

  // After max attempts, if we still have an expiring token, return null
  console.error("[AUTH] Failed to get valid token after max attempts");
  return null;
}

export async function getServerSession() {
  return await auth();
}
