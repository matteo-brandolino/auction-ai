import { io, Socket } from "socket.io-client";
import type { BidPlacedEvent, WebSocketEvent } from "@/types/auction";

class WebSocketService {
  private socket: Socket | null = null;
  private readonly url: string;

  constructor() {
    this.url = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3005";
  }

  connect(userId: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(this.url, {
      auth: { userId },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {});
    this.socket.on("disconnect", () => {});
    this.socket.on("error", () => {});

    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        this.disconnect();
      });
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinAuction(auctionId: string): void {
    if (!this.socket) throw new Error("Socket not connected");
    this.socket.emit("join-auction", auctionId);
  }

  leaveAuction(auctionId: string): void {
    if (!this.socket) {
      console.warn("Socket not connected, cannot leave auction");
      return;
    }
    this.socket.emit("leave-auction", auctionId);
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.socket) throw new Error("Socket not connected");
    this.socket.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void): void {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  onBidPlaced(callback: (data: BidPlacedEvent) => void): void {
    this.on("bid_placed", callback);
  }

  onAuctionEnded(callback: (data: WebSocketEvent) => void): void {
    this.on("auction-ended", callback);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const wsService = new WebSocketService();
