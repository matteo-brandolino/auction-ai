import { UserStats } from "../models/UserStats";
import { checkAchievements, notifyAchievementUnlocked } from "./achievement-checker";

const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const handleBidPlaced = async (bidEvent: {
  bidId: string;
  auctionId: string;
  bidderId: string;
  bidderName: string;
  bidderEmail: string;
  amount: number;
  timestamp: Date;
}) => {
  try {
    const { bidderId, bidderName, bidderEmail, amount, auctionId } = bidEvent;

    let userStats = await UserStats.findOne({ userId: bidderId });

    if (!userStats) {
      userStats = new UserStats({
        userId: bidderId,
        name: bidderName,
        email: bidderEmail,
        totalBids: 0,
        totalSpent: 0,
        auctionsWon: 0,
        bidsToday: 0,
        lastBidDate: new Date(),
        activeAuctions: [],
      });
    }

    userStats.totalBids += 1;
    userStats.name = bidderName;
    userStats.email = bidderEmail;

    if (!isToday(userStats.lastBidDate)) {
      userStats.bidsToday = 1;
    } else {
      userStats.bidsToday += 1;
    }
    userStats.lastBidDate = new Date();

    if (!userStats.activeAuctions.includes(auctionId)) {
      userStats.activeAuctions.push(auctionId);
    }

    await userStats.save();

    const achievements = await checkAchievements(bidderId);
    for (const achievement of achievements) {
      await notifyAchievementUnlocked(achievement);
    }

    console.log(`Updated stats for user ${bidderName}: ${userStats.totalBids} total bids`);
  } catch (error) {
    console.error("Error handling BID_PLACED event:", error);
  }
};

export const handleAuctionEnded = async (auctionEvent: {
  id: string;
  title: string;
  winnerId?: string;
  winnerName?: string;
  winnerEmail?: string;
  finalPrice: number;
  totalBids: number;
  endTime: Date;
}) => {
  try {
    const { id, title, winnerId, winnerName, winnerEmail, finalPrice } = auctionEvent;

    const allUsers = await UserStats.find({
      activeAuctions: id,
    });

    for (const user of allUsers) {
      user.activeAuctions = user.activeAuctions.filter((aId) => aId !== id);
      await user.save();
    }

    if (winnerId && winnerName && winnerEmail) {
      let winnerStats = await UserStats.findOne({ userId: winnerId });

      if (!winnerStats) {
        winnerStats = new UserStats({
          userId: winnerId,
          name: winnerName,
          email: winnerEmail,
          totalBids: 0,
          totalSpent: 0,
          auctionsWon: 0,
          bidsToday: 0,
          lastBidDate: new Date(),
          activeAuctions: [],
        });
      }

      winnerStats.auctionsWon += 1;
      winnerStats.totalSpent += finalPrice;
      winnerStats.name = winnerName;
      winnerStats.email = winnerEmail;

      if (
        !winnerStats.biggestWin ||
        finalPrice > winnerStats.biggestWin.amount
      ) {
        winnerStats.biggestWin = {
          auctionId: id,
          auctionTitle: title,
          amount: finalPrice,
        };
      }

      await winnerStats.save();

      console.log(
        `Updated winner stats for ${winnerName}: ${winnerStats.auctionsWon} auctions won`
      );
    }
  } catch (error) {
    console.error("Error handling AUCTION_ENDED event:", error);
  }
};
