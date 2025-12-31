import type {
  LoginResponse,
  RegisterResponse,
  LoginCredentials,
  RegisterData,
} from "@/types/auth";

import type { Auction, Bid } from "@/types/auction";
import type { Item, CreateItemData, CreateAuctionData } from "@/types/item";

export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        console.error(
          `API Error [${response.status}] ${endpoint}: Failed to parse error response`
        );
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.error(`API Error [${response.status}] ${endpoint}:`, errorData);
      const errorMessage =
        errorData.message || errorData.error || JSON.stringify(errorData);
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return this.request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(data: RegisterData): Promise<RegisterResponse> {
    return this.request<RegisterResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getAuctions(filters?: {
    status?: string;
    category?: string;
  }): Promise<Auction[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.category) params.append("category", filters.category);

    const query = params.toString();
    return this.request<Auction[]>(`/api/auctions${query ? `?${query}` : ""}`);
  }

  async getAuctionById(id: string): Promise<Auction> {
    return this.request<Auction>(`/api/auctions/${id}`);
  }

  async placeBid(
    auctionId: string,
    amount: number,
    token?: string
  ): Promise<Bid> {
    return this.request<Bid>("/api/bids", {
      method: "POST",
      body: JSON.stringify({ auctionId, amount }),
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  }

  async getBidsByAuction(auctionId: string): Promise<Bid[]> {
    return this.request<Bid[]>(`/api/bids/auction/${auctionId}`);
  }

  async getItems(token: string): Promise<{ items: Item[] }> {
    return this.request<{ items: Item[] }>("/api/items", {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async createItem(
    data: CreateItemData,
    token: string
  ): Promise<{ item: Item }> {
    return this.request<{ item: Item }>("/api/items", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async createAuction(
    data: CreateAuctionData,
    token: string
  ): Promise<{ auction: Auction }> {
    return this.request<{ auction: Auction }>("/api/auctions", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getMyAuctions(token: string): Promise<{ auctions: Auction[] }> {
    return this.request<{ auctions: Auction[] }>("/api/auctions?sellerId=me", {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async publishAuction(
    auctionId: string,
    token: string
  ): Promise<{ message: string; auction: Auction }> {
    return this.request<{ message: string; auction: Auction }>(
      `/api/auctions/${auctionId}/publish`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }
}

export const apiClient = new ApiClient();
