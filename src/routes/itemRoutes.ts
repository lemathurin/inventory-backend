import express from "express";
import { authenticateToken } from "../middleware/auth";
import {
  getAllUserItems,
  createItem,
  getItem,
} from "../controllers/itemController";

const router = express.Router();

// Get all items for the authenticated user
router.get("/", authenticateToken, getAllUserItems);

// Create a new item for a specific home
router.post("/:homeId/item", authenticateToken, createItem);

// Get a specific item (with user access check)
router.get("/:itemId", authenticateToken, getItem);

// Update an existing item
// router.put("/:itemId", authenticateToken, updateItem);

// Delete an existing item
// router.delete("/:itemId", authenticateToken, deleteItem);

export default router;
