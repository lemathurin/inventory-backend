import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

export const getAllItems = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await prisma.item.findMany({
      where: { ownerId: req.user!.userId }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch items' });
  }
};

export const getItemsByHome = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const homeId = String(req.params.homeId);
    console.log('Fetching items for homeId:', homeId);

    const home = await prisma.home.findFirst({
      where: {
        id: homeId,
        users: {
          some: {
            id: req.user!.userId
          }
        }
      }
    });

    if (!home) {
      return res.status(404).json({ error: 'Home not found or you do not have permission to access it' });
    }

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
};

export const createItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const homeId = String(req.params.homeId);

    console.log('Creating item:', { name, description, homeId, userId: req.user!.userId });

    const item = await prisma.item.create({
      data: {
        name,
        description,
        ownerId: req.user!.userId,
        homeId: homeId
      },
    });

    console.log('Item created:', item);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Could not create item', details: (error as Error).message });
  }
};

export const updateItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    const { name, description, purchaseDate, price, warranty } = req.body;

    console.log('Updating item:', { itemId, ...req.body });

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

    console.log('Item updated:', updatedItem);
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Could not update item', details: (error as Error).message });
  }
};

export const deleteItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { homeId, itemId } = req.params;

    console.log('Attempting to delete item:', { homeId, itemId, userId: req.user!.userId });

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

    await prisma.item.delete({
      where: { id: itemId },
    });

    console.log('Item deleted successfully:', itemId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Could not delete item', details: (error as Error).message });
  }
};
