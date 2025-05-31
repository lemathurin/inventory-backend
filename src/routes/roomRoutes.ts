import { Router } from "express";
import {
  createRoomInHome,
  getRoomDetails,
  updateRoom,
  //   deleteRoom,
} from "../controllers/roomController";
import { authenticateToken } from "../middleware/auth";
import { requireRoomAdmin } from "@/middleware/permissions";

const router = Router();

// Create a new room in a specific home
router.post("/:homeId/room", authenticateToken, createRoomInHome);

// Get a room's details
router.get("/:roomId", authenticateToken, getRoomDetails);

// Update a room's name
router.patch("/:roomId", authenticateToken, requireRoomAdmin, updateRoom);

// Update a room's settings
// router.patch("/:roomId", authenticateToken, updateRoom);

// Delete a room
// router.delete("/:roomId", authenticateToken, deleteRoom);

// Get users in room
// router.get("/:roomId/users", authenticateToken, )

// Add a user to a room
// router.post("/:roomId/users", authenticateToken, )

// Remove a user from a room
// router.delete("/:roomId/users/:userId", authenticateToken, )

export default router;
