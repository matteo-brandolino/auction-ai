import { Request, Response } from "express";
import mongoose from "mongoose";
import { Achievement, ACHIEVEMENT_DEFINITIONS } from "../models/Achievement";
import { User } from "../models/User";
import { publishAchievementEvent } from "../services/kafka-producer";

export const unlockAchievement = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const internalService = req.headers["x-internal-service"];

    if (internalService !== "leaderboard-service") {
      res.status(403).json({ error: "Forbidden - Internal service only" });
      return;
    }

    const { achievementId, userId, metadata } = req.body;

    if (!achievementId || !userId) {
      res.status(400).json({ error: "Missing achievementId or userId" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: "Invalid userId format" });
      return;
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const existingAchievement = await Achievement.findOne({
      userId: userObjectId,
      achievementId,
    });

    if (existingAchievement) {
      res.status(200).json({
        message: "Achievement already unlocked",
        achievement: existingAchievement,
      });
      return;
    }

    const achievement = new Achievement({
      userId: userObjectId,
      achievementId,
      metadata: metadata || {},
    });

    await achievement.save();

    const achievementDef = ACHIEVEMENT_DEFINITIONS.find(
      (def) => def.id === achievementId
    );

    if (achievementDef) {
      await publishAchievementEvent({
        eventType: "ACHIEVEMENT_UNLOCKED",
        userId,
        achievementId,
        achievementName: achievementDef.name,
        achievementDescription: achievementDef.description,
        achievementIcon: achievementDef.icon,
        achievementPoints: achievementDef.points,
        timestamp: new Date(),
      });
    }

    res.status(201).json({
      message: "Achievement unlocked",
      achievement,
    });
  } catch (error) {
    console.error("Unlock achievement error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserAchievements = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: "Invalid userId format" });
      return;
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const achievements = await Achievement.find({ userId: userObjectId }).sort({
      unlockedAt: -1,
    });

    res.status(200).json({
      achievements,
      count: achievements.length,
    });
  } catch (error) {
    console.error("Get user achievements error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
