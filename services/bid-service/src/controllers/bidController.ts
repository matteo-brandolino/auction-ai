import { Request, Response } from "express";
import { Bid } from "../models/Bid";
import mongoose from "mongoose";
import { publishBidEvent } from "../services/kafka";
import { AuctionResponse } from "../types/auction";

// POST /api/bids - Place a bid
export const placeBid = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { auctionId, amount } = req.body;

    if (!auctionId || !amount) {
      res.status(400).json({
        error: "Missing required fields",
        required: ["auctionId", "amount"],
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(auctionId)) {
      res.status(400).json({ error: "Invalid auction ID" });
      return;
    }

    if (typeof amount !== "number" || amount <= 0) {
      res.status(400).json({ error: "Invalid bid amount" });
      return;
    }

    // Fetch auction details from Auction Service
    const auctionResponse = await fetch(
      `${process.env.AUCTION_SERVICE_URL}/api/auctions/${auctionId}`,
      {
        headers: {
          "x-user-id": userId,
          "x-user-email": req.user?.email || "",
          "x-user-role": req.user?.role || "user",
        },
      }
    );

    if (!auctionResponse.ok) {
      if (auctionResponse.status === 404) {
        res.status(404).json({ error: "Auction not found" });
        return;
      }
      res.status(400).json({ error: "Failed to verify auction" });
      return;
    }

    const auctionData = (await auctionResponse.json()) as AuctionResponse;
    const auction = auctionData.auction;

    if (auction.status !== "active") {
      res.status(400).json({
        error: "Auction not active",
        message: `Auction is ${auction.status}`,
      });
      return;
    }

    const minBidAmount = auction.currentPrice + auction.minIncrement;
    if (amount < minBidAmount) {
      res.status(400).json({
        error: "Bid amount too low",
        message: `Minimum bid is ${minBidAmount}`,
        currentPrice: auction.currentPrice,
        minIncrement: auction.minIncrement,
      });
      return;
    }

    if (auction.sellerId === userId) {
      res.status(400).json({
        error: "Cannot bid on your own auction",
      });
      return;
    }

    const bid = new Bid({
      auctionId,
      bidderId: userId,
      amount,
      timestamp: new Date(),
      status: "pending",
    });

    await bid.save();

    await publishBidEvent({
      eventType: "BID_PLACED",
      bidId: bid._id.toString(),
      auctionId: auctionId,
      bidderId: userId,
      amount: amount,
      timestamp: bid.timestamp,
    });

    res.status(201).json({
      message: "Bid placed successfully",
      bid: {
        id: bid._id,
        auctionId: bid.auctionId,
        amount: bid.amount,
        timestamp: bid.timestamp,
        status: bid.status,
      },
    });
  } catch (error) {
    console.error("PlaceBid error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/bids - List my bids
export const listMyBids = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const bids = await Bid.find({ bidderId: userId })
      .sort({ timestamp: -1 })
      .limit(100);

    res.status(200).json({
      bids: bids.map((bid) => ({
        id: bid._id,
        auctionId: bid.auctionId,
        amount: bid.amount,
        timestamp: bid.timestamp,
        status: bid.status,
      })),
    });
  } catch (error) {
    console.error("ListMyBids error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/bids/auction/:auctionId - Get bids for auction
export const getBidsForAuction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { auctionId } = req.params;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(auctionId)) {
      res.status(400).json({ error: "Invalid auction ID" });
      return;
    }

    const bids = await Bid.find({ auctionId })
      .sort({ timestamp: -1 })
      .limit(50);

    res.status(200).json({
      bids: bids.map((bid) => ({
        id: bid._id.toString(),
        auctionId: bid.auctionId.toString(),
        bidderId: bid.bidderId.toString(),
        amount: bid.amount,
        timestamp: bid.timestamp,
        status: bid.status,
      })),
    });
  } catch (error) {
    console.error("GetBidsForAuction error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
