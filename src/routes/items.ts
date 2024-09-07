import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all items for the user
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const items = await prisma.item.findMany({
      where: { ownerId: req.user!.userId }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch items' });
  }
});

// Get all items for a specific home
router.get('/:homeId/items', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const homeId = String(req.params.homeId);
    console.log('Fetching items for homeId:', homeId);
    const items = await prisma.item.findMany({
      where: {
        homeId: homeId,
        ownerId: req.user!.userId,
      }
    });
    console.log('Items found:', items.length);
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Could not fetch items' });
  }
});

// Create a new item for a specific home
router.post('/:homeId/items', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, description } = req.body;
    const homeId = String(req.params.homeId);  // Change to String to match UUID
    
    console.log('Creating item:', { name, description, homeId, userId: req.user!.userId });  // Add this log

    const item = await prisma.item.create({
      data: {
        name,
        description,
        ownerId: req.user!.userId,
        homeId: homeId
      },
    });

    console.log('Item created:', item);  // Add this log

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);  // Improve error logging
    res.status(500).json({ error: 'Could not create item', details: (error as Error).message });
  }
});

// Update an existing item
router.put('/:homeId/items/:itemId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { itemId } = req.params;
    const { name, description, purchaseDate, price, warranty } = req.body;
    
    console.log('Updating item:', { itemId, ...req.body });  // Add this log

    // Verify that the item belongs to the authenticated user and the specified home
    const existingItem = await prisma.item.findFirst({
      where: {
        id: itemId,
        homeId: req.params.homeId,
        ownerId: req.user!.userId,
      },
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found or you do not have permission to update it' });
    }

    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: {
        name,
        description,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        price: price !== undefined ? parseFloat(price as string) : null,
        warranty: warranty !== undefined ? parseInt(warranty as string) : null,
      },
    });

    console.log('Item updated:', updatedItem);  // Add this log

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);  // Improve error logging
    res.status(500).json({ error: 'Could not update item', details: (error as Error).message });
  }
});

// Delete an existing item
router.delete('/:homeId/items/:itemId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { homeId, itemId } = req.params;
    
    console.log('Attempting to delete item:', { homeId, itemId, userId: req.user!.userId });  // Add this log

    // Verify that the item belongs to the authenticated user and the specified home
    const existingItem = await prisma.item.findFirst({
      where: {
        id: itemId,
        homeId: homeId,
        ownerId: req.user!.userId,
      },
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found or you do not have permission to delete it' });
    }

    // Delete the item
    await prisma.item.delete({
      where: { id: itemId },
    });

    console.log('Item deleted successfully:', itemId);  // Add this log

    res.status(204).send(); // 204 No Content is typically used for successful DELETE operations
  } catch (error) {
    console.error('Error deleting item:', error);  // Improve error logging
    res.status(500).json({ error: 'Could not delete item', details: (error as Error).message });
  }
});

export default router;