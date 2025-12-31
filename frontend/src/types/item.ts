export interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  images?: string[];
  ownerId: string;
  status: "available" | "in_auction" | "sold";
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemData {
  title: string;
  description: string;
  category: string;
  condition: string;
  images?: string[];
}

export interface CreateAuctionData {
  title: string;
  description: string;
  itemId: string;
  category: string;
  startingPrice: number;
  minIncrement?: number;
  reservePrice?: number;
  startTime: string;
  endTime: string;
  autoExtendSeconds?: number;
}
