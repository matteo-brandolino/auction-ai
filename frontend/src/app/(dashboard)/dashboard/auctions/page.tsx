import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CountdownTimer } from "@/components/auction/countdown-timer";
import type { Auction } from "@/types/auction";
import { getServerAccessToken, getServerSession } from "@/lib/auth-helpers";
import { Landmark, Gem } from "lucide-react";
import { AuctionListClient } from "./auction-list-client";

export const dynamic = "force-dynamic";

async function getAuctions(token: string): Promise<Auction[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  try {
    const res = await fetch(`${apiUrl}/api/auctions?status=active`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch auctions: ${res.status}`);
    }

    const data = await res.json();
    return data.auctions || [];
  } catch (error) {
    console.error("Error fetching auctions:", error);
    return [];
  }
}

export default async function AuctionsPage() {
  const session = await getServerSession();
  const token = await getServerAccessToken();

  if (!session || !token) {
    redirect("/login");
  }

  const auctions = await getAuctions(token);

  return (
    <div className="p-6 space-y-6 p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-1">
            Live Auctions
          </h2>
          <p className="text-muted-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></span>
            Browse active auctions and place bids
          </p>
        </div>
        <Link href="/dashboard/auctions/new">
          <button className="px-6 py-3 bg-primary text-primary-foreground hover:bg-[var(--navy-dark)] rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl">
            Create Auction
          </button>
        </Link>
      </div>

      <AuctionListClient initialAuctions={auctions} token={token} />
    </div>
  );
}
