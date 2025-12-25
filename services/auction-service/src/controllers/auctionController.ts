import { Request, Response } from "express";
import { Auction } from "../models/Auction";
import mongoose from "mongoose";
import {
  checkAuctionOwnership,
  checkAuctionCanBeModified,
  checkAuctionCanBeDeleted,
  checkAuctionCanBeStarted,
  validateAuctionTiming,
} from "../utils/auctionValidation";
import { ItemResponse, ItemUpdateResponse } from "../types/item";

// POST /api/auctions - Create auction
export const createAuction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const {
      title,
      description,
      itemId,
      category,
      startingPrice,
      minIncrement,
      reservePrice,
      startTime,
      endTime,
      autoExtendSeconds,
    } = req.body;

    if (
      !title ||
      !description ||
      !itemId ||
      !category ||
      !startingPrice ||
      !startTime ||
      !endTime
    ) {
      res.status(400).json({
        error: "Missing required fields",
        required: [
          "title",
          "description",
          "itemId",
          "category",
          "startingPrice",
          "startTime",
          "endTime",
        ],
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      res.status(400).json({ error: "Invalid item ID" });
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (!validateAuctionTiming(start, end, res)) return;

    // Verify item exists and is available
    try {
      const itemResponse = await fetch(
        `${process.env.ITEM_SERVICE_URL}/api/items/${itemId}`,
        {
          headers: {
            "x-user-id": userId,
            "x-user-email": req.user?.email || "",
            "x-user-role": req.user?.role || "user",
          },
        }
      );

      if (!itemResponse.ok) {
        if (itemResponse.status === 404) {
          res.status(404).json({ error: "Item not found" });
          return;
        }
        res.status(400).json({ error: "Failed to verify item" });
        return;
      }

      const itemData = (await itemResponse.json()) as ItemResponse;
      const item = itemData.item;
      // Verify item is available
      if (item.status !== "available") {
        res.status(400).json({
          error: "Item not available",
          message: "This item is already in an auction or sold",
        });
        return;
      }

      // Set item status to "in_auction"
      const updateResponseRaw = await fetch(
        `${process.env.ITEM_SERVICE_URL}/api/items/${itemId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
            "x-user-email": req.user?.email || "",
            "x-user-role": req.user?.role || "user",
          },
          body: JSON.stringify({ status: "in_auction" }),
        }
      );

      if (!updateResponseRaw.ok) {
        res.status(500).json({
          error: "Failed to update item status",
        });
        return;
      }
      const updateData = (await updateResponseRaw.json()) as ItemUpdateResponse;
      console.log(`Update item ${updateData.item.id} ${updateData.item.title}`);
    } catch (error) {
      console.error("Item service call failed:", error);
      res.status(500).json({
        error: "Failed to communicate with Item Service",
      });
      return;
    }

    const auction = new Auction({
      title,
      description,
      itemId,
      sellerId: userId,
      category,
      startingPrice,
      currentPrice: startingPrice,
      minIncrement: minIncrement || 10,
      reservePrice: reservePrice || null,
      startTime: start,
      endTime: end,
      originalEndTime: end,
      autoExtendSeconds: autoExtendSeconds || 10,
      status: "draft",
      totalBids: 0,
      viewerCount: 0,
    });

    await auction.save();

    res.status(201).json({
      message: "Auction created successfully",
      auction: {
        id: auction._id,
        title: auction.title,
        description: auction.description,
        itemId: auction.itemId,
        category: auction.category,
        startingPrice: auction.startingPrice,
        currentPrice: auction.currentPrice,
        minIncrement: auction.minIncrement,
        startTime: auction.startTime,
        endTime: auction.endTime,
        status: auction.status,
        createdAt: auction.createdAt,
      },
    });
  } catch (error: any) {
    console.error("CreateAuction error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/auctions - List auctions with filters
export const listAuctions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status, category, sellerId } = req.query;
    const filter: any = {};

    if (status && typeof status === "string") {
      filter.status = status;
    }

    if (category && typeof category === "string") {
      filter.category = category;
    }

    if (sellerId && typeof sellerId === "string") {
      if (!mongoose.Types.ObjectId.isValid(sellerId)) {
        res.status(400).json({ error: "Invalid seller ID" });
        return;
      }
      filter.sellerId = sellerId;
    }

    const auctions = await Auction.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      auctions: auctions.map((auction) => ({
        id: auction._id,
        title: auction.title,
        description: auction.description,
        itemId: auction.itemId,
        sellerId: auction.sellerId,
        category: auction.category,
        startingPrice: auction.startingPrice,
        currentPrice: auction.currentPrice,
        startTime: auction.startTime,
        endTime: auction.endTime,
        status: auction.status,
        totalBids: auction.totalBids,
        uniqueBidders: auction.uniqueBidders,
        createdAt: auction.createdAt,
      })),
    });
  } catch (error) {
    console.error("ListAuctions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/auctions/active - Get active auctions
export const getActiveAuctions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const auctions = await Auction.find({ status: "active" })
      .sort({ endTime: 1 })
      .limit(50);

    res.status(200).json({
      auctions: auctions.map((auction) => ({
        id: auction._id,
        title: auction.title,
        currentPrice: auction.currentPrice,
        endTime: auction.endTime,
        totalBids: auction.totalBids,
        category: auction.category,
      })),
    });
  } catch (error) {
    console.error("GetActiveAuctions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/auctions/upcoming - Get upcoming auctions
export const getUpcomingAuctions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const now = new Date();

    const auctions = await Auction.find({
      status: "pending",
      startTime: { $gt: now },
    })
      .sort({ startTime: 1 })
      .limit(50);

    res.status(200).json({
      auctions: auctions.map((auction) => ({
        id: auction._id,
        title: auction.title,
        startingPrice: auction.startingPrice,
        startTime: auction.startTime,
        category: auction.category,
      })),
    });
  } catch (error) {
    console.error("GetUpcomingAuctions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/auctions/ended - Get ended auctions
export const getEndedAuctions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const auctions = await Auction.find({ status: "ended" })
      .sort({ endTime: -1 }) // Most recently ended first
      .limit(50);

    res.status(200).json({
      auctions: auctions.map((auction) => ({
        id: auction._id,
        title: auction.title,
        currentPrice: auction.currentPrice,
        winnerId: auction.winnerId,
        endTime: auction.endTime,
        totalBids: auction.totalBids,
        category: auction.category,
      })),
    });
  } catch (error) {
    console.error("GetEndedAuctions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// GET /api/auctions/:id - Get auction details
export const getAuctionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid auction ID" });
      return;
    }

    const auction = await Auction.findById(id);

    if (!auction) {
      res.status(404).json({ error: "Auction not found" });
      return;
    }

    res.status(200).json({
      auction: {
        id: auction._id,
        title: auction.title,
        description: auction.description,
        itemId: auction.itemId,
        sellerId: auction.sellerId,
        category: auction.category,
        startingPrice: auction.startingPrice,
        currentPrice: auction.currentPrice,
        minIncrement: auction.minIncrement,
        reservePrice: auction.reservePrice,
        startTime: auction.startTime,
        endTime: auction.endTime,
        originalEndTime: auction.originalEndTime,
        autoExtendSeconds: auction.autoExtendSeconds,
        status: auction.status,
        winnerId: auction.winnerId,
        winningBidId: auction.winningBidId,
        totalBids: auction.totalBids,
        uniqueBidders: auction.uniqueBidders,
        viewerCount: auction.viewerCount,
        createdAt: auction.createdAt,
        updatedAt: auction.updatedAt,
      },
    });
  } catch (error) {
    console.error("GetAuctionById error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH /api/auctions/:id - Update auction (only draft)
export const updateAuction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid auction ID" });
      return;
    }

    const auction = await Auction.findById(id);

    if (!auction) {
      res.status(404).json({ error: "Auction not found" });
      return;
    }

    if (!checkAuctionOwnership(auction, userId, res)) return;
    if (!checkAuctionCanBeModified(auction, res)) return;

    const {
      title,
      description,
      category,
      startingPrice,
      minIncrement,
      reservePrice,
      startTime,
      endTime,
      autoExtendSeconds,
    } = req.body;

    if (title) auction.title = title;
    if (description) auction.description = description;
    if (category) auction.category = category;
    if (startingPrice) {
      auction.startingPrice = startingPrice;
      auction.currentPrice = startingPrice; // Reset current price
    }
    if (minIncrement) auction.minIncrement = minIncrement;
    if (reservePrice !== undefined) auction.reservePrice = reservePrice;
    if (autoExtendSeconds !== undefined)
      auction.autoExtendSeconds = autoExtendSeconds;

    if (startTime || endTime) {
      const newStartTime = startTime ? new Date(startTime) : auction.startTime;
      const newEndTime = endTime ? new Date(endTime) : auction.endTime;

      if (!validateAuctionTiming(newStartTime, newEndTime, res)) return;

      auction.startTime = newStartTime;
      auction.endTime = newEndTime;
      auction.originalEndTime = newEndTime;
    }

    await auction.save();

    res.status(200).json({
      message: "Auction updated successfully",
      auction: {
        id: auction._id,
        title: auction.title,
        description: auction.description,
        startingPrice: auction.startingPrice,
        currentPrice: auction.currentPrice,
        startTime: auction.startTime,
        endTime: auction.endTime,
        status: auction.status,
        updatedAt: auction.updatedAt,
      },
    });
  } catch (error) {
    console.error("UpdateAuction error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/auctions/:id - Delete auction (only draft/pending)
export const deleteAuction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid auction ID" });
      return;
    }

    const auction = await Auction.findById(id);

    if (!auction) {
      res.status(404).json({ error: "Auction not found" });
      return;
    }

    if (!checkAuctionOwnership(auction, userId, res)) return;
    if (!checkAuctionCanBeDeleted(auction, res)) return;

    // Set item status back to "available"
    try {
      const updateResponse = await fetch(
        `${process.env.ITEM_SERVICE_URL}/api/items/${auction.itemId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
            "x-user-email": req.user?.email || "",
            "x-user-role": req.user?.role || "user",
          },
          body: JSON.stringify({ status: "available" }),
        }
      );

      if (!updateResponse.ok) {
        console.error("Failed to update item status back to available");
        // Don't block deletion, just log the error
      }
    } catch (error) {
      console.error("Item service call failed:", error);
      // Don't block deletion, just log the error
    }

    await Auction.findByIdAndDelete(id);

    res.status(200).json({
      message: "Auction deleted successfully",
    });
  } catch (error) {
    console.error("DeleteAuction error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/auctions/:id/start - Start auction manually
export const startAuction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid auction ID" });
      return;
    }

    const auction = await Auction.findById(id);

    if (!auction) {
      res.status(404).json({ error: "Auction not found" });
      return;
    }

    if (!checkAuctionOwnership(auction, userId, res)) return;
    if (!checkAuctionCanBeStarted(auction, res)) return;

    auction.status = "active";
    await auction.save();

    res.status(200).json({
      message: "Auction started successfully",
      auction: {
        id: auction._id,
        title: auction.title,
        status: auction.status,
        startTime: auction.startTime,
        endTime: auction.endTime,
        currentPrice: auction.currentPrice,
      },
    });
  } catch (error) {
    console.error("StartAuction error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/auctions/:id/publish - Publish auction (draft → pending)
export const publishAuction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid auction ID" });
      return;
    }

    const auction = await Auction.findById(id);

    if (!auction) {
      res.status(404).json({ error: "Auction not found" });
      return;
    }

    if (!checkAuctionOwnership(auction, userId, res)) return;

    if (auction.status !== "draft") {
      res.status(400).json({
        error: "Bad Request",
        message: "Only draft auctions can be published",
      });
      return;
    }

    auction.status = "pending";
    await auction.save();

    res.status(200).json({
      message: "Auction published successfully",
      auction: {
        id: auction._id,
        title: auction.title,
        status: auction.status,
        startTime: auction.startTime,
        endTime: auction.endTime,
      },
    });
  } catch (error) {
    console.error("PublishAuction error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
