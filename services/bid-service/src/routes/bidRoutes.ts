import { Router } from "express";
import {
  placeBid,
  listMyBids,
  getBidsForAuction,
} from "../controllers/bidController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.post("/", placeBid); // POST /api/bids
router.get("/", listMyBids); // GET /api/bids
router.get("/auction/:auctionId", getBidsForAuction); // GET /api/bids/auction/:auctionId

export default router;
