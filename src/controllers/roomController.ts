import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";
import * as roomModel from "../models/roomModel";

const prisma = new PrismaClient();

// Create a new room in a home
export const createRoomInHome = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { homeId } = req.params;
    const { name } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

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
    const room = await roomModel.getRoomDetails(roomId);

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

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Room name is required" });
    }

    const updatedRoom = await roomModel.updateRoomName(roomId, name);
    res.status(200).json({
      message: "Room name updated successfully",
      room: updatedRoom,
    });
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({
      error: "Failed to update room name",
      details: (error as Error).message,
    });
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    // Check if room exists and has items
    const room = await roomModel.getRoomDetails(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    if (room.items && room.items.length > 0) {
      return res.status(400).json({ error: "Cannot delete room with items" }); //NOTE: Temporary
    }

    await roomModel.deleteRoomById(roomId);
    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({
      error: "Failed to delete room",
      details: (error as Error).message,
    });
  }
};

export const getRoomUsers = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const room = await roomModel.getRoomUsers(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Extract and format user data
    const users = room.users.map((userRoom) => ({
      ...userRoom.user,
      isAdmin: userRoom.admin,
    }));

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching room users:", error);
    res.status(500).json({
      error: "Failed to fetch room users",
      details: (error as Error).message,
    });
  }
};

export const addUserToRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Check if the room exists
    const room = await roomModel.getRoomDetails(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Check if the user is already in the room
    const existingUser = room.users.find(
      (userRoom) => userRoom.user.id === userId
    );
    if (existingUser) {
      return res.status(400).json({ error: "User is already in the room" });
    }

    // Add the user to the room
    const updatedRoom = await roomModel.addUserToRoom(roomId, userId);
    res.status(200).json(updatedRoom);
  } catch (error) {
    console.error("Error adding user to room:", error);
    res.status(500).json({
      error: "Failed to add user to room",
      details: (error as Error).message,
    });
  }
};

export const removeUserFromRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;

    // Check if the room exists
    const room = await roomModel.getRoomDetails(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Check if the user is in the room
    const userInRoom = room.users.find(
      (userRoom) => userRoom.user.id === userId
    );
    if (!userInRoom) {
      return res.status(400).json({ error: "User is not in the room" });
    }

    // Remove the user from the room
    await roomModel.removeUserFromRoom(roomId, userId);
    res.status(200).json({ message: "User removed from room successfully" });
  } catch (error) {
    console.error("Error removing user from room:", error);
    res.status(500).json({
      error: "Failed to remove user from room",
      details: (error as Error).message,
    });
  }
};

export const getRoomPermissions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { roomId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const membership = await roomModel.findUserRoomMembership(userId, roomId);

    if (!membership) {
      return res
        .status(404)
        .json({ error: "User is not a member of this room" });
    }

    res.json({ admin: membership.admin });
  } catch (error) {
    console.error("Error fetching room permissions:", error);
    res.status(500).json({
      error: "Failed to fetch room permissions",
      details: (error as Error).message,
    });
  }
};
