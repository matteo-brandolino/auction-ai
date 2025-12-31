import mongoose, { Schema, Document } from "mongoose";

export interface IUserStats extends Document {
  userId: string;
  name: string;
  email: string;
  totalBids: number;
  totalSpent: number;
  auctionsWon: number;
  biggestWin: {
    auctionId: string;
    auctionTitle: string;
    amount: number;
  } | null;
  bidsToday: number;
  lastBidDate: Date;
  activeAuctions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserStatsSchema = new Schema<IUserStats>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    totalBids: {
      type: Number,
      default: 0,
      index: true,
    },
    totalSpent: {
      type: Number,
      default: 0,
      index: true,
    },
    auctionsWon: {
      type: Number,
      default: 0,
    },
    biggestWin: {
      type: {
        auctionId: String,
        auctionTitle: String,
        amount: Number,
      },
      default: null,
    },
    bidsToday: {
      type: Number,
      default: 0,
      index: true,
    },
    lastBidDate: {
      type: Date,
      default: Date.now,
    },
    activeAuctions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const UserStats = mongoose.model<IUserStats>("UserStats", UserStatsSchema);
