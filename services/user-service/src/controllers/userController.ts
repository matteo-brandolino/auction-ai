import { Request, Response } from "express";
import { User } from "../models/User";

// GET /api/users/me
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user from middleware authenticate
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        credits: user.credits,
        totalBids: user.totalBids,
        auctionsWon: user.auctionsWon,
        auctionsCreated: user.auctionsCreated,
        badges: user.badges,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/users/credits - testing use
export const updateCredits = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { amount } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (typeof amount !== "number") {
      res.status(400).json({ error: "Amount must be a number" });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    user.credits += amount;

    if (user.credits < 0) {
      res.status(400).json({ error: "Insufficient credits" });
      return;
    }

    await user.save();

    res.status(200).json({
      message: "Credits updated successfully",
      credits: user.credits,
    });
  } catch (error) {
    console.error("UpdateCredits error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
