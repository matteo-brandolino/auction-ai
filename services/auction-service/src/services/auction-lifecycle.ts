import { Auction } from "../models/Auction";
import { emitAuctionStartedEvent } from "./kafka-producer";

export const activateAuction = async (auctionId: string): Promise<boolean> => {
  try {
    const auction = await Auction.findById(auctionId);

    if (!auction) {
      console.warn(`Auction ${auctionId} not found`);
      return false;
    }

    if (auction.status !== "pending") {
      console.warn(`Auction ${auctionId} cannot start (status: ${auction.status})`);
      return false;
    }

    auction.status = "active";
    await auction.save();

    console.log(`Auction activated: ${auction.title}`);

    await emitAuctionStartedEvent({
      id: auction._id.toString(),
      title: auction.title,
      description: auction.description,
      category: auction.category,
      startingPrice: auction.startingPrice,
      currentPrice: auction.currentPrice,
      minIncrement: auction.minIncrement,
      endTime: auction.endTime,
      startTime: auction.startTime,
      totalBids: auction.totalBids,
      sellerId: auction.sellerId.toString(),
      itemId: auction.itemId.toString(),
    }).catch((err) => {
      console.error("Failed to emit AUCTION_STARTED event:", err);
    });

    return true;
  } catch (error) {
    console.error(`Failed to activate auction ${auctionId}:`, error);
    return false;
  }
};
