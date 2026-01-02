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
    <div className="space-y-6 p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">
            Live Auctions
          </h2>
          <p className="text-slate-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            Browse active auctions and place bids
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg px-6 py-3">
          <div className="text-xs text-slate-400 mb-1">Active Auctions</div>
          <div className="text-2xl font-bold text-white">{auctions.length}</div>
        </div>
      </div>

      {auctions.length === 0 ? (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Landmark className="w-16 h-16 mb-4 opacity-20 text-slate-600" />
          <h3 className="text-2xl font-bold text-white mb-2">No Active Auctions</h3>
          <p className="text-slate-400 mb-6">Check back soon for new auctions</p>
          <Link href="/dashboard/auctions/new">
            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded font-semibold transition-colors">
              Create Auction
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {auctions.map((auction) => (
            <Link key={auction.id} href={`/dashboard/auctions/${auction.id}`}>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white line-clamp-1">
                    {auction.title}
                  </h3>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    <span className="text-xs font-semibold text-green-500">LIVE</span>
                  </div>
                </div>

                <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                  {auction.description}
                </p>

                <div className="bg-slate-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Current Bid</div>
                      <div className="text-2xl font-bold text-amber-500">
                        ${auction.currentPrice}
                      </div>
                    </div>
                    <Gem className="w-8 h-8 text-amber-500/50" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800 rounded p-3">
                    <div className="text-xs text-slate-400 mb-1">Total Bids</div>
                    <div className="text-lg font-bold text-white">{auction.totalBids}</div>
                  </div>
                  <div className="bg-slate-800 rounded p-3">
                    <div className="text-xs text-slate-400 mb-1">Ends in</div>
                    <div className="text-lg font-bold text-white">
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
