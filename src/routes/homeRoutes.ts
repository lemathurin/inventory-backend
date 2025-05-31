import express from "express";
import { authenticateToken } from "../middleware/auth";
import {
  createHome,
  getHomeById,
  updateHome,
  deleteHome,
  getRoomsByHomeId,
} from "../controllers/homeController";

const router = express.Router();

// Create a new home
router.post("/", authenticateToken, createHome);

// Get a specific home by ID
router.get("/:homeId", authenticateToken, getHomeById);

// Update a specific home
router.patch("/:homeId", authenticateToken, updateHome);

// Delete a specific home
router.delete("/:homeId", authenticateToken, deleteHome);

// Get all rooms of a home
router.get("/:homeId/rooms", authenticateToken, getRoomsByHomeId);

// Get all items of a home
// router.get("/:homeId/items", authenticateToken, )

// Get all users of a home
// router.get("/:homeId/users", authenticateToken, )

// Add a user to a home
// router.post("/:homeId/users", authenticateToken, )

// Remove a user from a home
// router.delete("/:homeId/users/:userId", authenticateToken, )

// Invite routes

// Create a new invite for a home
// router.post("/:homeId/invites", authenticateToken, )

// List all invites for a home
// router.get("/:homeId/invites", authenticateToken, )

// Delete an invite code
// router.delete("/:homeId/invites/:inviteId", authenticateToken, )

// Accept an invite
// router.post("/invites/accept", )

export default router;
