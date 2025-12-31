import { Auction } from "../models/Auction";

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
    return true;
  } catch (error) {
    console.error(`Failed to activate auction ${auctionId}:`, error);
    return false;
  }
};
