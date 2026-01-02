"use server";

import { getServerAccessToken } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export async function publishAuctionAction(auctionId: string) {
  const token = await getServerAccessToken();

  if (!token) {
    redirect("/login");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const response = await fetch(`${apiUrl}/api/auctions/${auctionId}/publish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to publish auction");
  }

  return await response.json();
}

export async function getItemsAction() {
  const token = await getServerAccessToken();

  if (!token) {
    redirect("/login");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const response = await fetch(`${apiUrl}/api/items`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch items");
  }

  return await response.json();
}

export async function createAuctionAction(formData: {
  itemId: string;
  startingPrice: number;
  minIncrement: number;
  startTime: string;
  duration: number;
}) {
  const token = await getServerAccessToken();

  if (!token) {
    redirect("/login");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const response = await fetch(`${apiUrl}/api/auctions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create auction");
  }

  return await response.json();
}

export async function placeBidAction(auctionId: string, amount: number) {
  const token = await getServerAccessToken();

  if (!token) {
    redirect("/login");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const response = await fetch(`${apiUrl}/api/bids`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ auctionId, amount }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to place bid");
  }

  return await response.json();
}
