import { create } from "zustand";
import type { Auction, Bid } from "@/types/auction";

interface AuctionStore {
  auction: Auction | null;
  bids: Bid[];
  isLoading: boolean;
  error: string | null;

  setAuction: (auction: Auction) => void;
  setBids: (bids: Bid[]) => void;
  addBid: (bid: Bid) => void;
  updateAuctionPrice: (currentPrice: number, winnerId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAuctionStore = create<AuctionStore>((set) => ({
  auction: null,
  bids: [],
  isLoading: false,
  error: null,

  setAuction: (auction) => set({ auction }),

  setBids: (bids) => set({ bids }),

  addBid: (bid) =>
    set((state) => {
      // Check if bid already exists to prevent duplicates
      const bidExists = state.bids.some((b) => b.id === bid.id);
      if (bidExists) {
        return state;
      }
      return {
        bids: [bid, ...state.bids],
      };
    }),

  updateAuctionPrice: (currentPrice, winnerId) =>
    set((state) => ({
      auction: state.auction
        ? {
            ...state.auction,
            currentPrice,
            winnerId,
            totalBids: state.auction.totalBids + 1,
          }
        : null,
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  reset: () =>
    set({
      auction: null,
      bids: [],
      isLoading: false,
      error: null,
    }),
}));
