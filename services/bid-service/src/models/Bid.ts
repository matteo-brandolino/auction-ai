import mongoose, { Document, Schema } from "mongoose";

export interface IBid extends Document {
  auctionId: mongoose.Types.ObjectId;
  bidderId: mongoose.Types.ObjectId;
  amount: number;
  timestamp: Date;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;

  isOwnedBy(userId: string): boolean;
}

const BidSchema = new Schema<IBid>(
  {
    auctionId: {
      type: Schema.Types.ObjectId,
      required: [true, "Auction ID is required"],
      index: true,
    },
    bidderId: {
      type: Schema.Types.ObjectId,
      required: [true, "Bidder ID is required"],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Bid amount is required"],
      min: [1, "Bid amount must be at least 1"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

BidSchema.index({ auctionId: 1, timestamp: -1 });
BidSchema.index({ bidderId: 1, timestamp: -1 });

BidSchema.methods.isOwnedBy = function (userId: string): boolean {
  return this.bidderId.toString() === userId;
};

export const Bid = mongoose.model<IBid>("Bid", BidSchema);
