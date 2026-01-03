"use server";

import { getServerAccessToken } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function authenticatedFetch(
  endpoint: string,
  options?: RequestInit,
  errorMessage = "Request failed"
) {
  const token = await getServerAccessToken();

  if (!token) {
    redirect("/login");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || errorMessage);
  }

  return await response.json();
}

export async function publishAuctionAction(auctionId: string) {
  const result = await authenticatedFetch(
    `/api/auctions/${auctionId}/publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    "Failed to publish auction"
  );

  revalidatePath("/dashboard/my-auctions");
  revalidatePath("/dashboard/auctions");

  return result;
}

export async function getItemsAction() {
  return await authenticatedFetch(
    "/api/items",
    { cache: "no-store" },
    "Failed to fetch items"
  );
}

export async function createAuctionAction(formData: {
  itemId: string;
  title: string;
  description: string;
  category: string;
  startingPrice: number;
  minIncrement: number;
  startTime: string;
  endTime: string;
}) {
  const result = await authenticatedFetch(
    "/api/auctions",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    },
    "Failed to create auction"
  );

  revalidatePath("/dashboard/my-auctions");
  revalidatePath("/dashboard/items");

  return result;
}

export async function createItemAction(formData: {
  title: string;
  description: string;
  category: string;
  condition: string;
}) {
  const result = await authenticatedFetch(
    "/api/items",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    },
    "Failed to create item"
  );

  revalidatePath("/dashboard/items");

  return result;
}

export async function placeBidAction(auctionId: string, amount: number) {
  const result = await authenticatedFetch(
    "/api/bids",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auctionId, amount }),
    },
    "Failed to place bid"
  );

  revalidatePath(`/dashboard/auctions/${auctionId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leaderboard");

  return result;
}
