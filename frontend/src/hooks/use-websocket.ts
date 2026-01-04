"use client";

import { useEffect, useRef } from "react";
import { wsService } from "@/lib/websocket";
import type { BidPlacedEvent, WebSocketEvent } from "@/types/auction";

interface UseWebSocketProps {
  token: string;
  auctionId?: string;
  onBidPlaced?: (data: BidPlacedEvent) => void;
  onAuctionEnded?: (data: WebSocketEvent) => void;
  onAuctionStarted?: (data: any) => void;
}

export function useWebSocket({
  token,
  auctionId,
  onBidPlaced,
  onAuctionEnded,
  onAuctionStarted,
}: UseWebSocketProps) {
  useEffect(() => {
    if (!token) return;
    wsService.connect(token);
  }, [token]);

  useEffect(() => {
    if (!auctionId) return;

    console.log("[Hook] Joining auction:", auctionId);
    wsService.joinAuction(auctionId);

    return () => {
      console.log("[Hook] Leaving auction:", auctionId);
      wsService.leaveAuction(auctionId);
    };
  }, [auctionId]);

  // Use ref to keep callback stable
  const onBidPlacedRef = useRef(onBidPlaced);
  useEffect(() => {
    onBidPlacedRef.current = onBidPlaced;
  }, [onBidPlaced]);

  useEffect(() => {
    if (!onBidPlacedRef.current) return;

    console.log("[Hook] Registering bid_placed listener (stable)");
    const stableCallback = (data: BidPlacedEvent) => {
      onBidPlacedRef.current?.(data);
    };

    wsService.onBidPlaced(stableCallback);

    return () => {
      console.log("[Hook] Unregistering bid_placed listener (stable)");
      wsService.off("bid_placed", stableCallback);
    };
  }, []);

  useEffect(() => {
    if (!onAuctionEnded) return;

    wsService.onAuctionEnded(onAuctionEnded);

    return () => {
      wsService.off("auction-ended", onAuctionEnded);
    };
  }, [onAuctionEnded]);

  useEffect(() => {
    if (!onAuctionStarted) return;

    wsService.onAuctionStarted(onAuctionStarted);

    return () => {
      wsService.off("auction-started", onAuctionStarted);
    };
  }, [onAuctionStarted]);

  return {
    isConnected: wsService.isConnected(),
  };
}
