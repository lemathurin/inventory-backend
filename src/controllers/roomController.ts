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
