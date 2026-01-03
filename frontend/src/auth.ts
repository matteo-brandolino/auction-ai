import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { apiClient } from "@/lib/api-client";

async function refreshAccessToken(
  refreshToken: string
): Promise<string | null> {
  try {
    const data = await apiClient.request<{ accessToken: string }>(
      "/api/auth/refresh",
      {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      }
    );

    if (!data.accessToken) {
      return null;
    }

    return data.accessToken;
  } catch (error) {
    console.error("[AUTH] Failed to refresh token:", error);
    return null;
  }
}

/**
 * Decode JWT to get expiration time
 */
function getTokenExpiration(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch (error) {
    return null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await apiClient.login({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          return {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            role: response.user.role,
            accessToken: response.tokens.accessToken,
            refreshToken: response.tokens.refreshToken,
          };
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = getTokenExpiration(user.accessToken);
        console.log("[AUTH] New login - access token expires at:", new Date(token.accessTokenExpires as number).toISOString());
        return token;
      }

      const now = Date.now();
      const accessTokenExpires = token.accessTokenExpires as number;
      const timeUntilExpiry = accessTokenExpires - now;

      if (timeUntilExpiry < 2 * 60 * 1000) {
        console.log("[AUTH] Token expiring soon or expired, attempting refresh...", {
          expiresAt: new Date(accessTokenExpires).toISOString(),
          timeUntilExpiry: Math.round(timeUntilExpiry / 1000) + "s"
        });

        const newAccessToken = await refreshAccessToken(
          token.refreshToken as string
        );

        if (newAccessToken) {
          token.accessToken = newAccessToken;
          token.accessTokenExpires = getTokenExpiration(newAccessToken);
          console.log("[AUTH] Token refreshed successfully, new expiry:", new Date(token.accessTokenExpires as number).toISOString());
          return token;
        } else {
          console.error("[AUTH] Failed to refresh token - invalidating session");
          return null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
