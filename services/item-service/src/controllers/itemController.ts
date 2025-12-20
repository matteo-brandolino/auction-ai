import { Request, Response } from "express";
import { Item } from "../models/Item";
import mongoose from "mongoose";

// POST /api/items
export const createItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { title, description, images, category, condition } = req.body;

    if (!title || !description || !category || !condition) {
      res.status(400).json({
        error: "Title, description, category, and condition are required",
      });
      return;
    }

    const item = new Item({
      title,
      description,
      images: images || [],
      category,
      condition,
      ownerId: userId,
      status: "available",
    });

    await item.save();

    res.status(201).json({
      message: "Item created successfully",
      item: {
        id: item._id,
        title: item.title,
        description: item.description,
        images: item.images,
        category: item.category,
        condition: item.condition,
        status: item.status,
        createdAt: item.createdAt,
      },
    });
  } catch (error: any) {
    console.error("CreateItem error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/items
export const getMyItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Optional filter by status
    const { status } = req.query;
    const filter: any = { ownerId: userId };

    if (status && typeof status === "string") {
      filter.status = status;
    }

    const items = await Item.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      items: items.map((item) => ({
        id: item._id,
        title: item.title,
        description: item.description,
        images: item.images,
        category: item.category,
        condition: item.condition,
        status: item.status,
        auctionId: item.auctionId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    });
  } catch (error) {
    console.error("GetMyItems error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/items/:id
export const getItemById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid item ID" });
      return;
    }

    const item = await Item.findById(id);

    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    res.status(200).json({
      item: {
        id: item._id,
        title: item.title,
        description: item.description,
        images: item.images,
        category: item.category,
        condition: item.condition,
        ownerId: item.ownerId,
        status: item.status,
        auctionId: item.auctionId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    });
  } catch (error) {
    console.error("GetItemById error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PATCH /api/items/:id
export const updateItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid item ID" });
      return;
    }

    const item = await Item.findById(id);

    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    // Check ownership
    if (item.isOwnedBy(userId)) {
      res.status(403).json({ error: "You can only update your own items" });
      return;
    }

    // Cannot update if in auction
    if (item.isInAuction()) {
      res.status(400).json({
        error: "Cannot update item while it's in an auction",
      });
      return;
    }

    // Update allowed fields
    const { title, description, images, category, condition } = req.body;

    if (title) item.title = title;
    if (description) item.description = description;
    if (images) item.images = images;
    if (category) item.category = category;
    if (condition) item.condition = condition;

    await item.save();

    res.status(200).json({
      message: "Item updated successfully",
      item: {
        id: item._id,
        title: item.title,
        description: item.description,
        images: item.images,
        category: item.category,
        condition: item.condition,
        status: item.status,
        updatedAt: item.updatedAt,
      },
    });
  } catch (error) {
    console.error("UpdateItem error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/items/:id
export const deleteItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid item ID" });
      return;
    }

    const item = await Item.findById(id);

    if (!item) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    if (item.isOwnedBy(userId)) {
      res.status(403).json({ error: "You can only update your own items" });
      return;
    }

    if (item.isInAuction()) {
      res.status(400).json({
        error: "Cannot update item while it's in an auction",
      });
      return;
    }

    await Item.findByIdAndDelete(id);

    res.status(200).json({
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("DeleteItem error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
