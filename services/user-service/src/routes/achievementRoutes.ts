import { Router } from "express";
import {
  unlockAchievement,
  getUserAchievements,
} from "../controllers/achievementController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/unlock", unlockAchievement);

router.get("/my", authenticate, getUserAchievements);

export default router;
