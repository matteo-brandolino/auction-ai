import { Auction } from "../models/Auction";
import { emitAuctionEndedEvent } from "./kafka-producer";
import { activateAuction } from "./auction-lifecycle";

let schedulerInterval: NodeJS.Timeout | null = null;

export const startAuctionScheduler = () => {
  schedulerInterval = setInterval(async () => {
    await checkAndStartPendingAuctions();
    await checkAndCloseExpiredAuctions();
  }, 30 * 1000);

  console.log("Auction Scheduler started (30s interval)");
};

const checkAndStartPendingAuctions = async () => {
  try {
    const now = new Date();
    const pendingAuctions = await Auction.find({
      status: "pending",
      startTime: { $lt: now },
    }).lean();

    if (pendingAuctions.length === 0) {
      return;
    }

    console.log(`Starting ${pendingAuctions.length} pending auction(s)`);

    for (const auction of pendingAuctions) {
      await activateAuction(auction._id.toString());
    }
  } catch (error) {
    console.error("Start pending auctions error:", error);
  }
};

const checkAndCloseExpiredAuctions = async () => {
  try {
    const now = new Date();
    const expiredAuctions = await Auction.find({
      status: "active",
      endTime: { $lt: now },
    }).lean();

    if (expiredAuctions.length === 0) {
      return;
    }

    console.log(`Closing ${expiredAuctions.length} expired auction(s)`);

    for (const auction of expiredAuctions) {
      await Auction.updateOne(
        { _id: auction._id },
        { $set: { status: "ended" } }
      );

      await emitAuctionEndedEvent({
        id: auction._id.toString(),
        title: auction.title,
        winnerId: auction.winnerId?.toString(),
        finalPrice: auction.currentPrice,
        totalBids: auction.totalBids,
        endTime: auction.endTime,
      });
    }
  } catch (error) {
    console.error("Scheduler error:", error);
  }
};

export const stopAuctionScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
};
