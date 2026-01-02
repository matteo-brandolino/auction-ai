import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Auction } from "@/types/auction";
import { PublishButton } from "./publish-button";
import { getServerAccessToken, getServerSession } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

async function getMyAuctions(token: string): Promise<Auction[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  try {
    const res = await fetch(`${apiUrl}/api/auctions?sellerId=me`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch auctions: ${res.status}`);
    }

    const data = await res.json();
    return data.auctions || [];
  } catch (error) {
    console.error("Error fetching my auctions:", error);
    return [];
  }
}

export default async function MyAuctionsPage() {
  const session = await getServerSession();
  const token = await getServerAccessToken();

  if (!session || !token) {
    redirect("/login");
  }

  const auctions = await getMyAuctions(token);

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: "bg-slate-800 text-slate-300 border border-slate-700",
      pending: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
      active: "bg-green-500/10 text-green-400 border border-green-500/20",
      ended: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    };
    return badges[status as keyof typeof badges] || "bg-slate-800 text-slate-300 border border-slate-700";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: "Draft",
      pending: "Pending",
      active: "Active",
      ended: "Ended",
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">My Auctions</h2>
          <p className="text-slate-400">Manage your auction listings</p>
        </div>
        <Link href="/dashboard/items">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            Create New Auction
          </Button>
        </Link>
      </div>

      {auctions.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-10 text-center">
            <p className="text-slate-400 mb-4">
              You haven't created any auctions yet
            </p>
            <Link href="/dashboard/items">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Create Your First Auction
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {auctions.map((auction) => (
            <Card key={auction.id} className="bg-slate-900 border-slate-800">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl text-white">{auction.title}</CardTitle>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(auction.status)}`}
                      >
                        {getStatusLabel(auction.status)}
                      </span>
                    </div>
                    <CardDescription className="line-clamp-2 text-slate-400">
                      {auction.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {auction.status === "draft" && (
                      <PublishButton
                        auctionId={auction.id}
                        auctionTitle={auction.title}
                      />
                    )}
                    {auction.status === "active" && (
                      <Link href={`/dashboard/auctions/${auction.id}`}>
                        <Button size="sm" variant="outline">
                          View Live
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Starting Price:</span>
                    <p className="font-semibold text-white">${auction.startingPrice}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Current Price:</span>
                    <p className="font-semibold text-amber-500">
                      ${auction.currentPrice}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Bids:</span>
                    <p className="font-semibold text-white">{auction.totalBids}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">
                      {auction.status === "draft" || auction.status === "pending"
                        ? "Starts:"
                        : auction.status === "active"
                        ? "Ends:"
                        : "Ended:"}
                    </span>
                    <p className="font-semibold text-white">
                      {new Date(
                        auction.status === "active" || auction.status === "ended"
                          ? auction.endTime
                          : auction.startTime
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
