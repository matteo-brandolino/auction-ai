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
        <div className="bg-card border-2 border-border rounded-lg px-6 py-3 shadow-md">
          <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
            Active Auctions
          </div>
          <div className="text-2xl font-bold text-foreground">
            {auctions.length}
          </div>
        </div>
      </div>

      {auctions.length === 0 ? (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Landmark className="w-16 h-16 mb-4 opacity-20 text-muted-foreground" />
          <h3 className="text-2xl font-bold text-foreground mb-2">
            No Active Auctions
          </h3>
          <p className="text-muted-foreground mb-6">
            Check back soon for new auctions
          </p>
          <Link href="/dashboard/auctions/new">
            <button className="px-6 py-3 bg-primary text-primary-foreground hover:bg-[var(--navy-dark)] rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl">
              Create Auction
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {auctions.map((auction) => (
            <Link key={auction.id} href={`/dashboard/auctions/${auction.id}`}>
              <div className="bg-card border-2 border-border rounded-lg p-6 hover:border-[var(--coral-accent)] hover:shadow-xl transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground line-clamp-1">
                    {auction.title}
                  </h3>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-secondary/10 rounded-full border border-secondary/30">
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></span>
                    <span className="text-xs font-semibold text-secondary">
                      LIVE
                    </span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {auction.description}
                </p>

                <div className="bg-gradient-to-br from-[var(--gold-light)] to-[var(--gold-accent)]/20 rounded-lg p-4 mb-4 border border-[var(--gold-accent)]/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-foreground/70 mb-1 font-medium">
                        Current Bid
                      </div>
                      <div className="text-2xl font-bold text-[var(--navy-primary)]">
                        ${auction.currentPrice}
                      </div>
                    </div>
                    <Gem className="w-8 h-8 text-[var(--gold-accent)]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted rounded-lg p-3 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">
                      Total Bids
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {auction.totalBids}
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-3 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">
                      Ends in
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      <CountdownTimer endTime={auction.endTime} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
