import { NextResponse } from "next/server";
import { getServerAccessToken } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const accessToken = await getServerAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Return the token only when explicitly requested
    // This endpoint is called server-side by the achievement listener
    return NextResponse.json({ token: accessToken });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get token" },
      { status: 500 }
    );
  }
}
