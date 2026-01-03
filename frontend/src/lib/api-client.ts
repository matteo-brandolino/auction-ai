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
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  }

  private async refreshToken(): Promise<string | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const response = await fetch("/api/auth/refresh-client", {
          method: "POST",
        });

        if (!response.ok) {
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return null;
        }

        const data = await response.json();
        return data.accessToken;
      } catch (error) {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return null;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async request<T>(endpoint: string, options?: RequestInit, retryCount = 0): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (response.status === 401 && retryCount === 0) {
      console.log("[AUTH] Received 401, attempting refresh and retry...");

      const newToken = await this.refreshToken();

      if (newToken) {
        const authHeader = options?.headers
          ? (options.headers as Record<string, string>)["Authorization"]
          : undefined;

        if (authHeader?.startsWith("Bearer ")) {
          const newOptions = {
            ...options,
            headers: {
              ...options?.headers,
              Authorization: `Bearer ${newToken}`,
            },
          };

          console.log("[AUTH] Retrying request with new token...");
          return this.request<T>(endpoint, newOptions, retryCount + 1);
        }
      }
    }

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

  async getTopBidders(token: string, limit?: number): Promise<{ leaderboard: any[] }> {
    const query = limit ? `?limit=${limit}` : "";
    return this.request<{ leaderboard: any[] }>(`/api/leaderboard/top-bidders${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getMostActiveToday(token: string, limit?: number): Promise<{ leaderboard: any[] }> {
    const query = limit ? `?limit=${limit}` : "";
    return this.request<{ leaderboard: any[] }>(`/api/leaderboard/most-active-today${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getBiggestWins(token: string, limit?: number): Promise<{ leaderboard: any[] }> {
    const query = limit ? `?limit=${limit}` : "";
    return this.request<{ leaderboard: any[] }>(`/api/leaderboard/biggest-wins${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getMyRanking(token: string): Promise<any> {
    return this.request<any>("/api/leaderboard/my-ranking", {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getMe(token: string): Promise<{ user: any }> {
    return this.request<{ user: any }>("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getMyAchievements(token: string): Promise<{ achievements: any[]; count: number }> {
    return this.request<{ achievements: any[]; count: number }>("/api/achievements/my", {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}

export const apiClient = new ApiClient();
