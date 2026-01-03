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
      draft: "bg-muted text-muted-foreground border-2 border-border",
      pending: "bg-primary/10 text-primary border-2 border-primary/30",
      active: "bg-secondary/10 text-secondary border-2 border-secondary/30",
      ended: "bg-[var(--coral-accent)]/10 text-[var(--coral-accent)] border-2 border-[var(--coral-accent)]/30",
    };
    return badges[status as keyof typeof badges] || "bg-muted text-muted-foreground border-2 border-border";
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
          <h2 className="text-3xl font-bold text-foreground">My Auctions</h2>
          <p className="text-muted-foreground">Manage your auction listings</p>
        </div>
        <Link href="/dashboard/items">
          <Button className="bg-primary hover:bg-[var(--navy-dark)] shadow-md hover:shadow-lg">
            Create New Auction
          </Button>
        </Link>
      </div>

      {auctions.length === 0 ? (
        <Card className="bg-card border-2 border-border">
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground mb-4">
              You haven't created any auctions yet
            </p>
            <Link href="/dashboard/items">
              <Button className="bg-primary hover:bg-[var(--navy-dark)] shadow-md hover:shadow-lg">
                Create Your First Auction
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {auctions.map((auction) => (
            <Card key={auction.id} className="bg-card border-2 border-border hover:border-primary hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl text-foreground">{auction.title}</CardTitle>
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
                    <span className="text-muted-foreground">Starting Price:</span>
                    <p className="font-semibold text-foreground">${auction.startingPrice}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Price:</span>
                    <p className="font-semibold text-[var(--gold-accent)]">
                      ${auction.currentPrice}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Bids:</span>
                    <p className="font-semibold text-foreground">{auction.totalBids}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {auction.status === "draft" || auction.status === "pending"
                        ? "Starts:"
                        : auction.status === "active"
                        ? "Ends:"
                        : "Ended:"}
                    </span>
                    <p className="font-semibold text-foreground">
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
