import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import * as itemModel from "../models/itemModel";

export const getAllUserItems = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const items = await itemModel.findItemsByUserId(req.user!.userId);
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not fetch items" });
  }
};

// NOTE: Keep for test?
export const getItemsByHome = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const homeId = String(req.params.homeId);
    console.log("Fetching items for homeId:", homeId);

    // Check if home exists and user has access to it
    const home = await itemModel.findHomeByIdAndUserId(
      homeId,
      req.user!.userId
    );

    if (!home) {
      return res.status(404).json({
        error: "Home not found or you do not have permission to access it",
      });
    }

    // Get items for this home that the user has access to
    const items = await itemModel.findItemsByHomeAndUserId(
      homeId,
      req.user!.userId
    );

    console.log("Items found:", items.length);
    res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Could not fetch items" });
  }
};

export const createItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, roomId } = req.body;
    const homeId = String(req.params.homeId);

    const item = await itemModel.createNewItem(
      name,
      description,
      homeId,
      req.user!.userId,
      roomId
    );

    console.log("Item created:", item);
    res.status(201).json(item);
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({
      error: "Could not create item",
      details: (error as Error).message,
    });
  }
};
