import mongoose, { Document, Schema } from "mongoose";

export interface IAuction extends Document {
  title: string;
  description: string;
  itemId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  category: string;

  startingPrice: number;
  currentPrice: number;
  minIncrement: number;
  reservePrice?: number;

  startTime: Date;
  endTime: Date;
  originalEndTime: Date;
  autoExtendSeconds: number;

  status: "draft" | "pending" | "active" | "ended" | "cancelled";

  winnerId?: mongoose.Types.ObjectId;
  winningBidId?: mongoose.Types.ObjectId;

  totalBids: number;
  uniqueBidders: mongoose.Types.ObjectId[];
  viewerCount: number;

  createdAt: Date;
  updatedAt: Date;

  canBeModified(): boolean;
  canBeDeleted(): boolean;
  canBeStarted(): boolean;
  isOwnedBy(userId: string): boolean;
  isActive(): boolean;
  hasEnded(): boolean;
}

const AuctionSchema = new Schema<IAuction>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [100, "Title must be less than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description must be less than 2000 characters"],
    },
    itemId: {
      type: Schema.Types.ObjectId,
      required: [true, "Item ID is required"],
      index: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      required: [true, "Seller ID is required"],
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "electronics",
        "fashion",
        "home",
        "sports",
        "toys",
        "books",
        "art",
        "collectibles",
        "other",
      ],
    },
    startingPrice: {
      type: Number,
      required: [true, "Starting price is required"],
      min: [1, "Starting price must be at least 1"],
    },
    currentPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    minIncrement: {
      type: Number,
      required: [true, "Minimum increment is required"],
      min: [1, "Minimum increment must be at least 1"],
      default: 10,
    },
    reservePrice: {
      type: Number,
      min: [0, "Reserve price cannot be negative"],
      default: null,
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
      validate: {
        validator: function (this: IAuction, value: Date) {
          return value > this.startTime;
        },
        message: "End time must be after start time",
      },
    },
    originalEndTime: {
      type: Date,
      required: true,
    },
    autoExtendSeconds: {
      type: Number,
      default: 10,
      min: [0, "Auto-extend seconds cannot be negative"],
      max: [300, "Auto-extend cannot be more than 5 minutes"],
    },
    status: {
      type: String,
      enum: ["draft", "pending", "active", "ended", "cancelled"],
      default: "draft",
      index: true,
    },
    winnerId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    winningBidId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    totalBids: {
      type: Number,
      default: 0,
      min: [0, "Total bids cannot be negative"],
    },
    uniqueBidders: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
    viewerCount: {
      type: Number,
      default: 0,
      min: [0, "Viewer count cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for queries
AuctionSchema.index({ sellerId: 1, status: 1 });
AuctionSchema.index({ status: 1, startTime: 1 });
AuctionSchema.index({ status: 1, endTime: 1 });
AuctionSchema.index({ category: 1, status: 1 });

// Pre-save hook to set currentPrice and originalEndTime
AuctionSchema.pre("save", function (next) {
  if (this.isNew) {
    this.currentPrice = this.startingPrice;
    this.originalEndTime = this.endTime;
  }
  next();
});

AuctionSchema.methods.isOwnedBy = function (userId: string): boolean {
  return this.sellerId.toString() === userId;
};

AuctionSchema.methods.canBeModified = function (): boolean {
  return this.status === "draft";
};

AuctionSchema.methods.canBeDeleted = function (): boolean {
  return this.status === "draft" || this.status === "pending";
};

AuctionSchema.methods.canBeStarted = function (): boolean {
  return this.status === "pending";
};

AuctionSchema.methods.isActive = function (): boolean {
  return this.status === "active";
};

AuctionSchema.methods.hasEnded = function (): boolean {
  return this.status === "ended";
};

export const Auction = mongoose.model<IAuction>("Auction", AuctionSchema);
