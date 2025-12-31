import { Router } from "express";
import {
  getTopBidders,
  getMostActiveToday,
  getBiggestWins,
  getUserRanking,
} from "../controllers/leaderboardController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/top-bidders", getTopBidders);
router.get("/most-active-today", getMostActiveToday);
router.get("/biggest-wins", getBiggestWins);
router.get("/my-ranking", authMiddleware, getUserRanking);

export default router;
