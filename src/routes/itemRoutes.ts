import express from "express";
import { authenticateToken } from "../middleware/auth";
import { getAllUserItems, createItem } from "../controllers/itemController";

const router = express.Router();

// Get all items for the authenticated user
router.get("/", authenticateToken, getAllUserItems);

// Create a new item for a specific home
router.post("/:homeId/item", authenticateToken, createItem);

// Get item information
// router.get("/:itemId", authenticateToken, );

// Update an existing item
// router.put("/:itemId", authenticateToken, updateItem);

// Delete an existing item
// router.delete("/:itemId", authenticateToken, deleteItem);

export default router;
