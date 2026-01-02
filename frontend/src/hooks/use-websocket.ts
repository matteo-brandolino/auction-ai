"use client";

import { useEffect } from "react";
import { wsService } from "@/lib/websocket";
import type { BidPlacedEvent, WebSocketEvent } from "@/types/auction";

interface UseWebSocketProps {
  token: string;
  auctionId?: string;
  onBidPlaced?: (data: BidPlacedEvent) => void;
  onAuctionEnded?: (data: WebSocketEvent) => void;
}

export function useWebSocket({
  token,
  auctionId,
  onBidPlaced,
  onAuctionEnded,
}: UseWebSocketProps) {
  useEffect(() => {
    if (!token) return;
    wsService.connect(token);
  }, [token]);

  useEffect(() => {
    if (!auctionId) return;

    wsService.joinAuction(auctionId);

    return () => {
      wsService.leaveAuction(auctionId);
    };
  }, [auctionId]);

  useEffect(() => {
    if (!onBidPlaced) return;

    wsService.onBidPlaced(onBidPlaced);

    return () => {
      wsService.off("bid_placed", onBidPlaced);
    };
  }, [onBidPlaced]);

  useEffect(() => {
    if (!onAuctionEnded) return;

    wsService.onAuctionEnded(onAuctionEnded);

    return () => {
      wsService.off("auction-ended", onAuctionEnded);
    };
  }, [onAuctionEnded]);

  return {
    isConnected: wsService.isConnected(),
  };
}
