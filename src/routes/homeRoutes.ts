import express from "express";
import { authenticateToken } from "../middleware/auth";
import {
  createHome,
  getHomeById,
  updateHome,
  deleteHome,
  getRoomsByHomeId,
  createHomeInvite,
  getHomeInvites,
  deleteHomeInvite,
  acceptHomeInvite,
  getUsersByHomeId,
  removeUserFromHome,
  getHomePermissions,
} from "../controllers/homeController";
import { requireHomeAdmin } from "../middleware/permissions";

const router = express.Router();

// Create a new home
router.post("/", authenticateToken, createHome);

// Get a specific home by ID
router.get("/:homeId", authenticateToken, getHomeById);

// Update a specific home
router.patch("/:homeId", authenticateToken, requireHomeAdmin, updateHome);

// Delete a specific home
router.delete("/:homeId", authenticateToken, requireHomeAdmin, deleteHome);

// Get all rooms of a home
router.get("/:homeId/rooms", authenticateToken, getRoomsByHomeId);

// Get all items of a home
// router.get("/:homeId/items", authenticateToken, )

// Get all users of a home
router.get("/:homeId/users", authenticateToken, getUsersByHomeId);

// Add a user to a home
// router.post("/:homeId/users", authenticateToken, )

// Remove a user from a home
router.delete(
  "/:homeId/users/:userId",
  authenticateToken,
  requireHomeAdmin,
  removeUserFromHome
);

// Invite routes

// Create a new invite for a home
router.post(
  "/:homeId/invites",
  authenticateToken,
  requireHomeAdmin,
  createHomeInvite
);

// List all invites for a home
router.get(
  "/:homeId/invites",
  authenticateToken,
  requireHomeAdmin,
  getHomeInvites
);

// Delete an invite
router.delete(
  "/:homeId/invites/:inviteId",
  authenticateToken,
  requireHomeAdmin,
  deleteHomeInvite
);

// Accept an invite
router.post("/invites/accept", authenticateToken, acceptHomeInvite);

// Get user permissions for a home
router.get("/:homeId/permissions", authenticateToken, getHomePermissions);

export default router;
