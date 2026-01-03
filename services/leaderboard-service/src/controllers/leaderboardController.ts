import { Request, Response } from "express";
import { UserStats } from "../models/UserStats";
import { getRedis } from "../config/redis";

const CACHE_TTL = 60;

export const getTopBidders = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const cacheKey = `leaderboard:top-bidders:${limit}`;

    const redis = getRedis();
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log(`Cache HIT: ${cacheKey}`);
      return res.status(200).json(JSON.parse(cached));
    }

    console.log(`Cache MISS: ${cacheKey} - Querying DB`);
    const topBidders = await UserStats.find()
      .sort({ totalBids: -1 })
      .limit(limit)
      .select("userId name totalBids totalSpent");

    const response = {
      leaderboard: topBidders.map((user) => ({
        id: user.userId,
        name: user.name,
        totalBids: user.totalBids,
        credits: user.totalSpent,
      })),
    };

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(response));

    res.status(200).json(response);
  } catch (error) {
    console.error("GetTopBidders error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMostActiveToday = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const cacheKey = `leaderboard:most-active:${limit}`;

    const redis = getRedis();
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log(`Cache HIT: ${cacheKey}`);
      return res.status(200).json(JSON.parse(cached));
    }

    console.log(`Cache MISS: ${cacheKey} - Querying DB`);
    const mostActive = await UserStats.find({ bidsToday: { $gt: 0 } })
      .sort({ bidsToday: -1 })
      .limit(limit)
      .select("userId name bidsToday activeAuctions");

    const response = {
      leaderboard: mostActive.map((user) => ({
        id: user.userId,
        name: user.name,
        bidsToday: user.bidsToday,
        activeAuctions: user.activeAuctions.length,
      })),
    };

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(response));

    res.status(200).json(response);
  } catch (error) {
    console.error("GetMostActiveToday error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getBiggestWins = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const cacheKey = `leaderboard:biggest-wins:${limit}`;

    const redis = getRedis();
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log(`Cache HIT: ${cacheKey}`);
      return res.status(200).json(JSON.parse(cached));
    }

    console.log(`Cache MISS: ${cacheKey} - Querying DB`);
    const biggestWins = await UserStats.find({ biggestWin: { $ne: null } })
      .sort({ "biggestWin.amount": -1 })
      .limit(limit)
      .select("userId name biggestWin");

    const response = {
      leaderboard: biggestWins.map((user) => ({
        id: user.userId,
        name: user.name,
        auctionTitle: user.biggestWin?.auctionTitle || "",
        winAmount: user.biggestWin?.amount || 0,
      })),
    };

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(response));

    res.status(200).json(response);
  } catch (error) {
    console.error("GetBiggestWins error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserRanking = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const userStats = await UserStats.findOne({ userId });

    if (!userStats) {
      res.status(200).json({
        totalBidsRank: null,
        activityRank: null,
        biggestWin: null,
        stats: {
          totalBids: 0,
          bidsToday: 0,
          auctionsWon: 0,
          totalSpent: 0,
        },
      });
      return;
    }

    const totalBidsRank =
      (await UserStats.countDocuments({
        totalBids: { $gt: userStats.totalBids },
      })) + 1;

    const activityRank =
      (await UserStats.countDocuments({
        bidsToday: { $gt: userStats.bidsToday },
      })) + 1;

    res.status(200).json({
      totalBidsRank,
      activityRank,
      biggestWin: userStats.biggestWin,
      stats: {
        totalBids: userStats.totalBids,
        bidsToday: userStats.bidsToday,
        auctionsWon: userStats.auctionsWon,
        totalSpent: userStats.totalSpent,
      },
    });
  } catch (error) {
    console.error("GetUserRanking error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
