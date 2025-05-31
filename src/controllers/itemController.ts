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

export const getItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    const userId = req.user!.userId;

    const item = await itemModel.findItemByIdAndUserId(itemId, userId);

    if (!item) {
      return res.status(404).json({
        error: "Item not found or you do not have permission to access it",
      });
    }

    // Format the response
    const response = {
      ...item,
      users: item.users.map((userItem) => ({
        ...userItem.user,
        isAdmin: userItem.admin,
      })),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({
      error: "Failed to fetch item",
      details: (error as Error).message,
    });
  }
};

export const updateItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    const {
      name,
      description,
      roomId,
      public: isPublic,
      purchaseDate,
      price,
      hasWarranty,
      warrantyType,
      warrantyLength,
    } = req.body;

    // Validate at least one field is provided
    const hasUpdates = [
      name,
      description,
      roomId,
      isPublic,
      purchaseDate,
      price,
      hasWarranty,
      warrantyType,
      warrantyLength,
    ].some((field) => field !== undefined);

    if (!hasUpdates) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // Convert string dates to Date objects
    const parsedPurchaseDate = purchaseDate
      ? new Date(purchaseDate)
      : undefined;

    const updatedItem = await itemModel.updateItem(itemId, {
      name,
      description,
      roomId,
      public: isPublic,
      purchaseDate: parsedPurchaseDate,
      price,
      hasWarranty,
      warrantyType,
      warrantyLength,
    });

    res.status(200).json({
      message: "Item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({
      error: "Failed to update item",
      details: (error as Error).message,
    });
  }
};
