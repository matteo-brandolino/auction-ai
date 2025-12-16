import { Router } from "express";
import { getMe, updateCredits } from "../controllers/userController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/me", getMe);

router.post("/credits", updateCredits);

export default router;
