import mongoose, { Document, Schema } from "mongoose";

export interface IItem extends Document {
  title: string;
  description: string;
  images: string[];
  category: string;
  condition: "new" | "like_new" | "good" | "fair" | "poor";
  ownerId: mongoose.Types.ObjectId;
  status: "available" | "in_auction" | "sold";
  auctionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  isOwnedBy(userId: string): boolean;
  canBeModified(): boolean;
  isInAuction(): boolean;
}

const ItemSchema = new Schema<IItem>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title must be less than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description must be less than 2000 characters"],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (v: string[]) {
          return v.length <= 10; // Max 10 images
        },
        message: "Maximum 10 images allowed",
      },
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
    condition: {
      type: String,
      required: [true, "Condition is required"],
      enum: ["new", "like_new", "good", "fair", "poor"],
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      required: [true, "Owner ID is required"],
      index: true, // Index for queries
    },
    status: {
      type: String,
      enum: ["available", "in_auction", "sold"],
      default: "available",
    },
    auctionId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying user's items - Compound Index
ItemSchema.index({ ownerId: 1, status: 1 });

// Validator methods
ItemSchema.methods.isOwnedBy = function (userId: string): boolean {
  return this.ownerId.toString() === userId;
};

ItemSchema.methods.canBeModified = function (): boolean {
  return this.status === "available";
};

ItemSchema.methods.isInAuction = function (): boolean {
  return this.status !== "in_auction";
};

export const Item = mongoose.model<IItem>("Item", ItemSchema);
