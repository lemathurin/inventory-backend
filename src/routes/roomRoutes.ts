import { Router } from "express";
import {
  createRoomInHome,
  getRoomDetails,
  updateRoom,
  deleteRoom,
  getRoomUsers,
  addUserToRoom,
  removeUserFromRoom,
} from "../controllers/roomController";
import { authenticateToken } from "../middleware/auth";
import { requireRoomAdmin } from "../middleware/permissions";

const router = Router();

// Create a new room in a specific home
router.post("/:homeId/room", authenticateToken, createRoomInHome);

// Get a room's details
router.get("/:roomId", authenticateToken, getRoomDetails);

// Update a room
router.patch("/:roomId", authenticateToken, requireRoomAdmin, updateRoom);

// Delete a room
router.delete("/:roomId", authenticateToken, requireRoomAdmin, deleteRoom);

// Get all users in a room
router.get("/:roomId/users", authenticateToken, getRoomUsers);

// Add a user to a room
router.post(
  "/:roomId/users",
  authenticateToken,
  requireRoomAdmin,
  addUserToRoom
);

// Remove a user from a room
router.delete(
  "/:roomId/users",
  authenticateToken,
  requireRoomAdmin,
  removeUserFromRoom
);

export default router;
