"use client";

import { useState, useCallback } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import type { Auction } from "@/types/auction";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/auction/countdown-timer";
import { toast } from "sonner";

interface Props {
  initialAuctions: Auction[];
  token: string;
}

export function AuctionListClient({ initialAuctions, token }: Props) {
  const [auctions, setAuctions] = useState<Auction[]>(initialAuctions);

  const handleAuctionStarted = useCallback((event: any) => {
    const { data } = event;

    const newAuction: Auction = {
      id: data.auctionId,
      title: data.title,
      description: data.description,
      category: data.category,
      currentPrice: data.currentPrice,
      startingPrice: data.startingPrice,
      minIncrement: data.minIncrement,
      endTime: data.endTime,
      startTime: data.startTime,
      totalBids: data.totalBids || 0,
      status: "active",
      sellerId: data.sellerId,
      itemId: data.itemId,
      winnerId: undefined,
      winningBidId: undefined,
      uniqueBidders: [],
      viewerCount: 0,
      originalEndTime: data.endTime,
      autoExtendSeconds: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAuctions((prev) => {
      if (prev.some((a) => a.id === newAuction.id)) {
        return prev;
      }
      return [newAuction, ...prev].sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
    });

    toast.success(`New auction started: ${data.title}`);
  }, []);

  const handleAuctionEnded = useCallback((event: any) => {
    const { auctionId } = event.data;

    setAuctions((prev) => prev.filter((a) => a.id !== auctionId));
  }, []);

  useWebSocket({
    token,
    onAuctionStarted: handleAuctionStarted,
    onAuctionEnded: handleAuctionEnded,
  });

  if (auctions.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground mb-4">
            No active auctions at the moment
          </p>
          <p className="text-sm text-muted-foreground">
            Check back soon for new auctions!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {auctions.map((auction) => (
        <Link key={auction.id} href={`/dashboard/auctions/${auction.id}`}>
          <Card className="border-2 hover:border-primary transition-all cursor-pointer hover:shadow-lg h-full">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-xl line-clamp-1">
                  {auction.title}
                </CardTitle>
                <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full shrink-0">
                  <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                  LIVE
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Current Bid
                </p>
                <p className="text-2xl font-bold bg-gradient-to-r from-[var(--gold-accent)] to-yellow-600 bg-clip-text text-transparent">
                  ${auction.currentPrice}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Bids</p>
                  <p className="font-semibold">{auction.totalBids}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time Left</p>
                  <CountdownTimer endTime={auction.endTime} />
                </div>
              </div>
              <Button className="w-full bg-primary hover:bg-[var(--navy-dark)]">
                View Auction
              </Button>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
