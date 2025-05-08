import express from "express";
import { authenticateToken } from "../middleware/auth";
import {
  getAllItems,
  getItemsByHome,
  createItem,
  updateItem,
  deleteItem,
} from "../controllers/itemController";

const router = express.Router();

// Get all items for the authenticated user
router.get("/", authenticateToken, getAllItems);

// Get all items for a specific home
router.get("/:homeId/items", authenticateToken, getItemsByHome);

// Create a new item for a specific home
router.post("/:homeId/items", authenticateToken, createItem);

// Update an existing item
router.put("/:homeId/items/:itemId", authenticateToken, updateItem);

// Delete an existing item
router.delete("/:homeId/items/:itemId", authenticateToken, deleteItem);

export default router;
