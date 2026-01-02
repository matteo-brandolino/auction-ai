import { UserStats } from "../models/UserStats";

interface AchievementToUnlock {
  achievementId: string;
  userId: string;
  metadata?: Record<string, any>;
}

export const checkAchievements = async (
  userId: string
): Promise<AchievementToUnlock[]> => {
  const userStats = await UserStats.findOne({ userId });

  if (!userStats) {
    return [];
  }

  const achievements: AchievementToUnlock[] = [];

  if (userStats.totalBids === 1) {
    achievements.push({ achievementId: "first_bid", userId });
  }

  if (userStats.totalBids === 10) {
    achievements.push({ achievementId: "bids_10", userId });
  }

  if (userStats.totalBids === 50) {
    achievements.push({ achievementId: "bids_50", userId });
  }

  if (userStats.totalBids === 100) {
    achievements.push({ achievementId: "bids_100", userId });
  }

  if (userStats.auctionsWon === 1) {
    achievements.push({ achievementId: "first_win", userId });
  }

  if (userStats.auctionsWon === 5) {
    achievements.push({ achievementId: "wins_5", userId });
  }

  if (userStats.auctionsWon === 10) {
    achievements.push({ achievementId: "wins_10", userId });
  }

  if (userStats.totalSpent >= 100 && userStats.totalSpent < 1000) {
    achievements.push({ achievementId: "spend_100", userId });
  }

  if (userStats.totalSpent >= 1000 && userStats.totalSpent < 10000) {
    achievements.push({ achievementId: "spend_1000", userId });
  }

  if (userStats.totalSpent >= 10000) {
    achievements.push({ achievementId: "spend_10000", userId });
  }

  return achievements;
};

export const notifyAchievementUnlocked = async (
  achievement: AchievementToUnlock
): Promise<void> => {
  try {
    const userServiceUrl = process.env.USER_SERVICE_URL || "http://localhost:3002";

    await fetch(`${userServiceUrl}/api/achievements/unlock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-service": "leaderboard-service",
      },
      body: JSON.stringify(achievement),
    });
  } catch (error) {
    console.error("Failed to notify achievement unlock:", error);
  }
};
