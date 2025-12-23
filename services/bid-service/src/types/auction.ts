export interface Auction {
  id: string;
  title: string;
  sellerId: string;
  itemId: string;
  category: string;
  startingPrice: number;
  currentPrice: number;
  minIncrement: number;
  reservePrice?: number;
  startTime: string;
  endTime: string;
  status: "draft" | "pending" | "active" | "ended" | "cancelled";
  winnerId?: string;
  totalBids: number;
  uniqueBidders: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AuctionResponse {
  auction: Auction;
}
