import { auth } from "@/auth";
import { getToken } from "next-auth/jwt";
import { cookies, headers } from "next/headers";
import { NextRequest } from "next/server";

export async function getServerAccessToken(): Promise<string | null> {
  const headersList = await headers();
  const cookiesList = await cookies();

  const token = await getToken({
    req: {
      headers: Object.fromEntries(headersList),
      cookies: Object.fromEntries(
        cookiesList.getAll().map((c) => [c.name, c.value])
      ),
    } as unknown as NextRequest,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  });

  return token?.accessToken as string | null;
}

export async function getServerSession() {
  return await auth();
}
