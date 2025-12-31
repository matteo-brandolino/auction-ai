import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { apiClient } from "@/lib/api-client";

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(
  refreshToken: string
): Promise<string | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const response = await fetch(`${apiUrl}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    return data.accessToken;
  } catch (error) {
    console.error("Error refreshing access token:", error);
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
        return token;
      }

      // Token is still valid ?
      const now = Date.now();
      const accessTokenExpires = token.accessTokenExpires as number;
      const timeUntilExpiry = accessTokenExpires - now;

      // Refresh if token expires in less than 5 minutes
      if (timeUntilExpiry < 5 * 60 * 1000) {
        const newAccessToken = await refreshAccessToken(
          token.refreshToken as string
        );

        if (newAccessToken) {
          token.accessToken = newAccessToken;
          token.accessTokenExpires = getTokenExpiration(newAccessToken);
        } else {
          console.error(
            "[NextAuth] Failed to refresh token, user needs to re-login"
          );
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
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
