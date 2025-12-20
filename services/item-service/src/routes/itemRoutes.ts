import { Router } from "express";
import {
  createItem,
  getMyItems,
  getItemById,
  updateItem,
  deleteItem,
} from "../controllers/itemController";
import { authenticate } from "../middleware/auth";

const router = Router();

// Protected routes
router.use(authenticate);

router.get("/:id", getItemById); // GET /api/items/:id
router.post("/", createItem); // POST /api/items
router.get("/", getMyItems); // GET /api/items
router.patch("/:id", updateItem); // PATCH /api/items/:id
router.delete("/:id", deleteItem); // DELETE /api/items/:id

export default router;
