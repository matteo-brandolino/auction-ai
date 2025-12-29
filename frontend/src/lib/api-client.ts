import type {
  LoginResponse,
  RegisterResponse,
  LoginCredentials,
  RegisterData,
} from "@/types/auth";

import type { Auction, Bid } from "@/types/auction";

export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    console.log("[ApiClient] baseUrl:", this.baseUrl);
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
      const error = await response.json();
      throw new Error(error.error || `Api request ${this.baseUrl} failed`);
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
}

export const apiClient = new ApiClient();
