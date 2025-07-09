import express from "express";
import { authenticateToken } from "../middleware/auth";
import {
  getAllUserItems,
  getItemsByHome,
  getItemsByRoom,
  createItem,
  getItem,
  updateItem,
  deleteItem,
  getItemPermissions,
} from "../controllers/itemController";
import { requireItemAdmin } from "../middleware/permissions";

const router = express.Router();

// Get all items for the authenticated user
router.get("/", authenticateToken, getAllUserItems);

// Get all authenticated user's items + public items for a specific home
router.get("/home/:homeId", authenticateToken, getItemsByHome);

// Get all authenticated user's items + public items for a specific room
router.get("/room/:roomId", authenticateToken, getItemsByRoom);

// Create a new item for a specific home
router.post("/:homeId/item", authenticateToken, createItem);

// Get a specific item (with user access check)
router.get("/:itemId", authenticateToken, getItem);

// Update an existing item
router.patch("/:itemId", authenticateToken, requireItemAdmin, updateItem);

// Delete an existing item
router.delete("/:itemId", authenticateToken, requireItemAdmin, deleteItem);

// Get user permissions for an item
router.get("/:itemId/permissions", authenticateToken, getItemPermissions);

export default router;
