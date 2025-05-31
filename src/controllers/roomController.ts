import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import * as roomModel from "../models/roomModel";

const prisma = new PrismaClient();

// Create a new room in a home
export const createRoomInHome = async (req: Request, res: Response) => {
  try {
    const { homeId } = req.params;
    const { name } = req.body;
    const userId = (req as any).user?.userId;

    if (!name) {
      return res.status(400).json({ error: "Room name is required" });
    }

    // Check if home exists
    const home = await prisma.home.findUnique({ where: { id: homeId } });
    if (!home) {
      return res.status(404).json({ error: "Home not found" });
    }

    const newRoom = await roomModel.createRoom(homeId, name, userId);
    res.status(201).json(newRoom);
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({
      error: "Failed to create room",
      details: (error as Error).message,
    });
  }
};

// Get a room's details
export const getRoomDetails = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        homes: true, // Include the home it belongs to
        items: true, // Include items in the room
        users: {
          // Include users associated with the room and their roles
          select: {
            user: { select: { id: true, name: true, email: true } },
            admin: true,
          },
        },
      },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({
      error: "Failed to get room details",
      details: (error as Error).message,
    });
  }
};

// // Modify a room's settings
// export const updateRoom = async (req: Request, res: Response) => {
//   try {
//     const { roomId } = req.params;
//     const { name, homeId } = req.body; // Allow changing name and potentially re-assigning to a new home

//     const updateData: { name?: string; homeId?: string } = {};
//     if (name) updateData.name = name;
//     if (homeId) {
//         // Check if new home exists
//         const homeExists = await prisma.home.findUnique({ where: { id: homeId } });
//         if (!homeExists) {
//             return res.status(404).json({ error: 'Target home not found' });
//         }
//         updateData.homeId = homeId;
//     }

//     if (Object.keys(updateData).length === 0) {
//         return res.status(400).json({ error: 'No update data provided' });
//     }

//     const updatedRoom = await prisma.room.update({
//       where: { id: roomId },
//       data: updateData,
//       include: {
//         home: true,
//       },
//     });
//     res.status(200).json(updatedRoom);
//   } catch (error: any) {
//     if (error.code === 'P2025') { // Prisma error code for record not found
//         return res.status(404).json({ error: 'Room not found' });
//     }
//     res.status(500).json({ error: 'Failed to update room', details: error.message });
//   }
// };

// // Delete a room
// export const deleteRoom = async (req: Request, res: Response) => {
//   try {
//     const { roomId } = req.params;

//     // Optional: Check for items in the room before deleting.
//     // Depending on your business logic, you might want to prevent deletion if the room is not empty,
//     // or reassign items, or delete them. For now, we'll proceed with deletion.

//     // Optional: Also need to handle UserRoom entries.
//     // Prisma's default behavior for relation tables might not automatically cascade deletes
//     // unless explicitly configured in the schema with onDelete.
//     // If not, you might need to delete UserRoom entries manually first.
//     // await prisma.userRoom.deleteMany({ where: { roomId } });

//     await prisma.room.delete({
//       where: { id: roomId },
//     });
//     res.status(204).send(); // No content
//   } catch (error: any) {
//     if (error.code === 'P2025') { // Prisma error code for record not found
//         return res.status(404).json({ error: 'Room not found' });
//     }
//     // Handle cases like foreign key constraints if items still reference the room
//     // and `onDelete` is not set to Cascade or SetNull for the Item-Room relation.
//     res.status(500).json({ error: 'Failed to delete room', details: error.message });
//   }
// };
