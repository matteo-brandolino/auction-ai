export interface Item {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  condition: string;
  status: "available" | "in_auction" | "sold";
  ownerId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ItemResponse {
  item: Item;
}

export interface ItemUpdateResponse {
  message: string;
  item: Item;
}
