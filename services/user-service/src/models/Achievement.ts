import mongoose, { Schema, Document } from "mongoose";

export interface IAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  achievementId: string;
  unlockedAt: Date;
  metadata?: Record<string, any>;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    achievementId: {
      type: String,
      required: true,
      index: true,
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

AchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

export const Achievement = mongoose.model<IAchievement>("Achievement", AchievementSchema);

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "first_steps" | "milestones" | "spending" | "winning" | "social" | "special";
  tier: "bronze" | "silver" | "gold" | "platinum";
  points: number;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: "first_bid",
    name: "First Bid",
    description: "Place your first bid",
    icon: "🎯",
    category: "first_steps",
    tier: "bronze",
    points: 10,
  },
  {
    id: "first_win",
    name: "First Victory",
    description: "Win your first auction",
    icon: "🏆",
    category: "first_steps",
    tier: "bronze",
    points: 50,
  },
  {
    id: "first_auction",
    name: "Auctioneer",
    description: "Create your first auction",
    icon: "📢",
    category: "first_steps",
    tier: "bronze",
    points: 25,
  },
  {
    id: "bids_10",
    name: "Active Bidder",
    description: "Place 10 bids",
    icon: "🎲",
    category: "milestones",
    tier: "bronze",
    points: 50,
  },
  {
    id: "bids_50",
    name: "Bid Enthusiast",
    description: "Place 50 bids",
    icon: "🎰",
    category: "milestones",
    tier: "silver",
    points: 100,
  },
  {
    id: "bids_100",
    name: "Bid Master",
    description: "Place 100 bids",
    icon: "💎",
    category: "milestones",
    tier: "gold",
    points: 250,
  },
  {
    id: "spend_100",
    name: "Starter Spender",
    description: "Spend $100 total",
    icon: "💰",
    category: "spending",
    tier: "bronze",
    points: 50,
  },
  {
    id: "spend_1000",
    name: "Big Spender",
    description: "Spend $1,000 total",
    icon: "💵",
    category: "spending",
    tier: "silver",
    points: 150,
  },
  {
    id: "spend_10000",
    name: "Whale",
    description: "Spend $10,000 total",
    icon: "🐋",
    category: "spending",
    tier: "platinum",
    points: 500,
  },
  {
    id: "wins_5",
    name: "Winner",
    description: "Win 5 auctions",
    icon: "🥇",
    category: "winning",
    tier: "silver",
    points: 100,
  },
  {
    id: "wins_10",
    name: "Champion",
    description: "Win 10 auctions",
    icon: "👑",
    category: "winning",
    tier: "gold",
    points: 250,
  },
  {
    id: "top_10",
    name: "Top 10",
    description: "Reach top 10 on leaderboard",
    icon: "⭐",
    category: "social",
    tier: "gold",
    points: 200,
  },
  {
    id: "top_3",
    name: "Podium Finisher",
    description: "Reach top 3 on leaderboard",
    icon: "🌟",
    category: "social",
    tier: "platinum",
    points: 500,
  },
  {
    id: "last_second_win",
    name: "Sniper",
    description: "Win auction in last 10 seconds",
    icon: "🎯",
    category: "special",
    tier: "gold",
    points: 300,
  },
  {
    id: "popular_auction",
    name: "Trendsetter",
    description: "Create auction with 50+ bids",
    icon: "🔥",
    category: "special",
    tier: "gold",
    points: 200,
  },
];
