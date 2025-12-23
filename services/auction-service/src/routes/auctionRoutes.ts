import { Router } from "express";
import {
  createAuction,
  listAuctions,
  getActiveAuctions,
  getUpcomingAuctions,
  getEndedAuctions,
  getAuctionById,
  updateAuction,
  deleteAuction,
  startAuction,
  publishAuction,
} from "../controllers/auctionController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);
router.get("/active", getActiveAuctions); // GET /api/auctions/active
router.get("/upcoming", getUpcomingAuctions); // GET /api/auctions/upcoming
router.get("/ended", getEndedAuctions); // GET /api/auctions/ended
router.get("/:id", getAuctionById); // GET /api/auctions/:id
router.post("/", createAuction); // POST /api/auctions
router.get("/", listAuctions); // GET /api/auctions (with filters)
router.patch("/:id", updateAuction); // PATCH /api/auctions/:id
router.delete("/:id", deleteAuction); // DELETE /api/auctions/:id
router.post("/:id/publish", publishAuction); // POST /api/auctions/:id/publish
router.post("/:id/start", startAuction); // POST /api/auctions/:id/start

export default router;
