export interface NotificationPayload {
  type:
    | "BID_PLACED"
    | "AUCTION_STARTED"
    | "AUCTION_ENDING"
    | "AUCTION_ENDED"
    | "ACHIEVEMENT_UNLOCKED"
    | "OUTBID";
  userId?: string;
  data: {
    auctionId?: string;
    message?: string;
    [key: string]: any;
  };
  timestamp: Date;
}

export interface WebSocketClient {
  id: string;
  userId?: string;
  ws: any;
}
