import { Router } from 'express';
import {
  createRoomInHome,
  getRoomDetails,
//   updateRoom,
//   deleteRoom,
} from '../controllers/roomController';
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Create a new room in a specific home
router.post('/home/:homeId/room', authenticateToken, createRoomInHome);

// Get a room's details
router.get('/room/:roomId', authenticateToken, getRoomDetails);

// Update a room's settings
// PUT /api/rooms/:roomId
// router.put('/rooms/:roomId', /*isAuthenticated,*/ updateRoom);

// Delete a room
// DELETE /api/rooms/:roomId
// router.delete('/rooms/:roomId', /*isAuthenticated,*/ deleteRoom);

export default router;