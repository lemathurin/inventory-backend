import express from "express";
import { authenticateToken } from "../middleware/auth";
import {
  getAllUserItems,
  createItem,
  getItem,
  updateItem,
} from "../controllers/itemController";
import { requireItemAdmin } from "../middleware/permissions";

const router = express.Router();

// Get all items for the authenticated user
router.get("/", authenticateToken, getAllUserItems);

// Create a new item for a specific home
router.post("/:homeId/item", authenticateToken, createItem);

// Get a specific item (with user access check)
router.get("/:itemId", authenticateToken, getItem);

// Update an existing item
router.patch("/:itemId", authenticateToken, requireItemAdmin, updateItem);

// Delete an existing item
// router.delete("/:itemId", authenticateToken, deleteItem);

export default router;
