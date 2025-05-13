import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import * as itemModel from "../models/itemModel";

export const getAllItems = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await itemModel.findItemsByUserId(req.user!.userId);
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not fetch items" });
  }
};

export const getItemsByHome = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const homeId = String(req.params.homeId);
    console.log("Fetching items for homeId:", homeId);

    // Check if home exists and user has access to it
    const home = await itemModel.findHomeByIdAndUserId(homeId, req.user!.userId);

    if (!home) {
      return res.status(404).json({
        error: "Home not found or you do not have permission to access it",
      });
    }

    // Get items for this home that the user has access to
    const items = await itemModel.findItemsByHomeAndUserId(homeId, req.user!.userId);

    console.log("Items found:", items.length);
    res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Could not fetch items" });
  }
};

export const createItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const homeId = String(req.params.homeId);

    console.log("Creating item:", {
      name,
      description,
      homeId,
      userId: req.user!.userId,
    });

    const item = await itemModel.createNewItem(
      name, 
      description, 
      homeId, 
      req.user!.userId
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

export const updateItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    const { name, description, purchaseDate, price } = req.body;

    console.log("Updating item:", { itemId, ...req.body });

    // Check if item exists and user has permission to update it
    const existingItem = await itemModel.findItemByIdAndHomeIdAndUserId(
      itemId,
      req.params.homeId,
      req.user!.userId
    );

    if (!existingItem) {
      return res.status(404).json({
        error: "Item not found or you do not have permission to update it",
      });
    }

    // Prepare update data
    const updateData = {
      name,
      description,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      price: price !== undefined ? parseFloat(price as string) : null,
    };

    // Update the item
    const updatedItem = await itemModel.updateItemById(itemId, updateData);

    console.log("Item updated:", updatedItem);
    res.json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({
      error: "Could not update item",
      details: (error as Error).message,
    });
  }
};

export const deleteItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { homeId, itemId } = req.params;

    console.log("Attempting to delete item:", {
      homeId,
      itemId,
      userId: req.user!.userId,
    });

    // Check if item exists and user has permission to delete it
    const existingItem = await itemModel.findItemByIdAndHomeIdAndUserId(
      itemId,
      homeId,
      req.user!.userId
    );

    if (!existingItem) {
      return res.status(404).json({
        error: "Item not found or you do not have permission to delete it",
      });
    }

    // Delete the item and its associations
    await itemModel.deleteItemById(itemId);

    console.log("Item deleted successfully:", itemId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({
      error: "Could not delete item",
      details: (error as Error).message,
    });
  }
};