import { AuctionRoomClient } from "./auction-room-client";
import type { Auction, Bid } from "@/types/auction";
import { redirect } from "next/navigation";
import { getServerAccessToken, getServerSession } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

async function getAuctionData(auctionId: string, token: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  try {
    const [auctionRes, bidsRes] = await Promise.all([
      fetch(`${apiUrl}/api/auctions/${auctionId}`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${apiUrl}/api/bids/auction/${auctionId}`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    if (!auctionRes.ok) {
      console.error("Auction fetch failed:", auctionRes.status);
      return null;
    }

    const auctionData = await auctionRes.json();
    const bidsData = bidsRes.ok ? await bidsRes.json() : { bids: [] };

    return {
      auction: auctionData.auction,
      bids: bidsData.bids || [],
    };
  } catch (error) {
    console.error("Error fetching auction:", error);
    return null;
  }
}

export default async function AuctionRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession();
  const token = await getServerAccessToken();

  if (!session || !token) {
    redirect("/login");
  }

  const { id } = await params;
  const data = await getAuctionData(id, token);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Auction not found</h1>
          <p className="text-gray-500 mt-2">
            The auction you're looking for doesn't exist
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuctionRoomClient
      initialAuction={data.auction}
      initialBids={data.bids}
      auctionId={id}
      userId={session.user.id}
      token={token}
    />
  );
}
