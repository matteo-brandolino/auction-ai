export type AuctionStatus =
  | "draft"
  | "pending"
  | "active"
  | "ended"
  | "cancelled";
export type BidStatus = "pending" | "accepted" | "rejected";
export type ItemStatus = "available" | "in_auction" | "sold";
export type ItemCondition = "new" | "like_new" | "good" | "fair" | "poor";
export type Category =
  | "electronics"
  | "fashion"
  | "home"
  | "sports"
  | "toys"
  | "books"
  | "art"
  | "collectibles"
  | "other";

export interface Item {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: Category;
  condition: ItemCondition;
  ownerId: string;
  status: ItemStatus;
  auctionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  itemId: string;
  sellerId: string;
  category: Category;

  startingPrice: number;
  currentPrice: number;
  minIncrement: number;
  reservePrice?: number;

  startTime: string;
  endTime: string;
  originalEndTime: string;
  autoExtendSeconds: number;

  status: AuctionStatus;

  winnerId?: string;
  winningBidId?: string;

  totalBids: number;
  uniqueBidders: string[];
  viewerCount: number;

  createdAt: string;
  updatedAt: string;

  item?: Item;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  amount: number;
  timestamp: string;
  status: BidStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BidPlacedEvent {
  eventType: "BID_PLACED";
  auctionId: string;
  bid: Bid;
  currentPrice: number;
  totalBids: number;
  winnerId: string;
}

export interface AuctionEndedEvent {
  eventType: "AUCTION_ENDED";
  auctionId: string;
  winnerId?: string;
  winningBid?: number;
}

export interface AuctionExtendedEvent {
  eventType: "AUCTION_EXTENDED";
  auctionId: string;
  newEndTime: string;
}

export type WebSocketEvent =
  | BidPlacedEvent
  | AuctionEndedEvent
  | AuctionExtendedEvent;
