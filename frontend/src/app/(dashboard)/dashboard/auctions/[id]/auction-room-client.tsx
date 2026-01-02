"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CountdownTimer } from "@/components/auction/countdown-timer";
import { useAuctionStore } from "@/stores/auction-store";
import { useWebSocket } from "@/hooks/use-websocket";
import { apiClient } from "@/lib/api-client";
import type { Auction, Bid, BidPlacedEvent } from "@/types/auction";

interface Props {
  initialAuction: Auction;
  initialBids: Bid[];
  auctionId: string;
  userId: string;
  token: string;
}

export function AuctionRoomClient({
  initialAuction,
  initialBids,
  auctionId,
  userId,
  token,
}: Props) {
  const { auction, bids, setAuction, setBids, addBid, updateAuctionPrice } =
    useAuctionStore();

  const [bidAmount, setBidAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAuction(initialAuction);
    setBids(initialBids);
    setBidAmount(initialAuction.currentPrice + initialAuction.minIncrement);
  }, [initialAuction, initialBids, setAuction, setBids]);

  useWebSocket({
    token,
    auctionId,
    onBidPlaced: (event: any) => {
      const { auctionId: eventAuctionId, amount, bidderId, bidId } = event.data;

      const newBid: Bid = {
        id: bidId,
        auctionId: eventAuctionId,
        bidderId,
        amount,
        timestamp: event.timestamp,
        status: "accepted",
        createdAt: event.timestamp,
        updatedAt: event.timestamp,
      };

      addBid(newBid);
      updateAuctionPrice(amount, bidderId);

      if (auction) {
        setBidAmount(amount + auction.minIncrement);
      }
    },
    onAuctionEnded: (data) => {},
  });

  async function handlePlaceBid() {
    if (!auction) return;

    const minBid = auction.currentPrice + auction.minIncrement;
    if (bidAmount < minBid) {
      setError(`Minimum bid is $${minBid}`);
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);

      const { placeBidAction } = await import("@/app/actions/auction-actions");
      await placeBidAction(auctionId, bidAmount);
    } catch (err: any) {
      setError(err.message || "Failed to place bid");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!auction) return null;

  const isWinning = auction.winnerId === userId;
  const minBid = auction.currentPrice + auction.minIncrement;
  const isEnded =
    new Date(auction.endTime) < new Date() || auction.status === "ended";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{auction.title}</h1>
          <p className="text-gray-500 mt-1">{auction.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Ends in</p>
            <CountdownTimer endTime={auction.endTime} className="text-xl" />
          </div>
          {isEnded ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600">
              ENDED
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              LIVE
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className={isWinning ? "border-2 border-green-500" : ""}>
            <CardHeader>
              <CardTitle>Current Bid</CardTitle>
              {isWinning && (
                <p className="text-sm text-green-600 font-medium">
                  🎉 You're winning!
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-violet-600">
                ${auction.currentPrice}
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Total Bids</p>
                  <p className="text-xl font-semibold mt-1">
                    {auction.totalBids}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Min Increment</p>
                  <p className="text-xl font-semibold mt-1">
                    ${auction.minIncrement}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Unique Bidders</p>
                  <p className="text-xl font-semibold mt-1">
                    {auction.uniqueBidders ? auction.uniqueBidders.length : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bid History</CardTitle>
              <CardDescription>Live bidding activity</CardDescription>
            </CardHeader>
            <CardContent>
              {bids.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  No bids yet. Be the first!
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {bids.map((bid, idx) => (
                    <div
                      key={bid.id}
                      className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                        idx === 0
                          ? "bg-violet-50 border border-violet-200"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            bid.bidderId === userId
                              ? "bg-green-500 text-white"
                              : "bg-gray-300 text-gray-700"
                          }`}
                        >
                          {bid.bidderId === userId
                            ? "YOU"
                            : `U${bid.bidderId.slice(-2)}`}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">${bid.amount}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(bid.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      {idx === 0 && (
                        <span className="text-xs font-medium text-violet-600">
                          LEADING
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Place Your Bid</CardTitle>
              <CardDescription>Minimum bid: ${minBid}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  min={minBid}
                  step={auction.minIncrement}
                  disabled={isEnded}
                  className="text-xl font-semibold"
                />
              </div>

              {isEnded && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
                  This auction has ended
                </div>
              )}

              {error && !isEnded && (
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}

              <Button
                onClick={handlePlaceBid}
                disabled={isSubmitting || bidAmount < minBid || isEnded}
                className="w-full bg-violet-600 hover:bg-violet-700 text-lg h-12 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEnded
                  ? "Auction Ended"
                  : isSubmitting
                  ? "Placing..."
                  : `Place Bid $${bidAmount}`}
              </Button>

              <div className="pt-4 border-t space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Ends in:</span>
                  <CountdownTimer endTime={auction.endTime} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-medium capitalize">
                    {auction.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-medium text-green-600 capitalize">
                    {auction.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
