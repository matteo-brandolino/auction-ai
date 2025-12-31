import { auth } from "@/auth";
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
  const session = await auth();

  if (!session?.accessToken) {
    redirect("/login");
  }

  const auctions = await getMyAuctions(session.accessToken);

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: "bg-gray-100 text-gray-800",
      pending: "bg-blue-100 text-blue-800",
      active: "bg-green-100 text-green-800",
      ended: "bg-red-100 text-red-800",
    };
    return badges[status as keyof typeof badges] || "bg-gray-100 text-gray-800";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Auctions</h2>
          <p className="text-gray-500">Manage your auction listings</p>
        </div>
        <Link href="/dashboard/items">
          <Button className="bg-violet-600 hover:bg-violet-700">
            Create New Auction
          </Button>
        </Link>
      </div>

      {auctions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-500 mb-4">
              You haven't created any auctions yet
            </p>
            <Link href="/dashboard/items">
              <Button className="bg-violet-600 hover:bg-violet-700">
                Create Your First Auction
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {auctions.map((auction) => (
            <Card key={auction.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{auction.title}</CardTitle>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(auction.status)}`}
                      >
                        {getStatusLabel(auction.status)}
                      </span>
                    </div>
                    <CardDescription className="line-clamp-2">
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
                    <span className="text-gray-500">Starting Price:</span>
                    <p className="font-semibold">${auction.startingPrice}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Current Price:</span>
                    <p className="font-semibold text-violet-600">
                      ${auction.currentPrice}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Bids:</span>
                    <p className="font-semibold">{auction.totalBids}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">
                      {auction.status === "draft" || auction.status === "pending"
                        ? "Starts:"
                        : auction.status === "active"
                        ? "Ends:"
                        : "Ended:"}
                    </span>
                    <p className="font-semibold">
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
