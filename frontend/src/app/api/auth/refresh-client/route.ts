import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    });

    if (!token?.refreshToken) {
      return NextResponse.json(
        { error: "No refresh token available" },
        { status: 401 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const response = await fetch(`${apiUrl}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to refresh token" },
        { status: 401 }
      );
    }

    const data = await response.json();

    return NextResponse.json({ accessToken: data.accessToken });
  } catch (error) {
    console.error("[AUTH] Error in refresh-client endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
